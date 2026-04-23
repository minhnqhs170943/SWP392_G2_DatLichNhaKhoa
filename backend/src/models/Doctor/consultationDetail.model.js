const { sql, poolPromise } = require('../../config/db');
const { sendMail } = require('../../config/mailer');

const getConsultationDetail = async (appointmentId, userId) => {
    const pool = await poolPromise;
    const request = pool.request();

    request.input('ApptID', sql.Int, appointmentId);
    request.input('UserID', sql.Int, userId);

    const infoQuery = `
        SELECT
            a.AppointmentID,
            u.FullName AS patientName,
            u.Phone AS phone,
            CONVERT(VARCHAR(10), a.AppointmentDate, 103) AS date,
            CONVERT(VARCHAR(5), a.AppointmentTime, 108) AS time,
            a.Note AS patientNote,
            a.MedicalRecord
        FROM Appointments a
        JOIN Users u ON a.PatientID = u.UserID
        WHERE a.AppointmentID = @ApptID 
        AND a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID)
    `;

    const serviceQuery = `
        SELECT
            s.ServiceID AS id,
            s.ServiceName AS name,
            aps.PriceAtBooking AS price
        FROM AppointmentServices aps
        JOIN Services s ON aps.ServiceID = s.ServiceID
        WHERE aps.AppointmentID = @ApptID
    `;

    const infoResult = await request.query(infoQuery);

    if (infoResult.recordset.length === 0) {
        throw new Error("Không tìm thấy ca khám hoặc bạn không có quyền truy cập!");
    }

    const servicesResult = await request.query(serviceQuery);

    return {
        ...infoResult.recordset[0],
        services: servicesResult.recordset
    };
};

const getAvailableProducts = async () => {
    const pool = await poolPromise;
    const query = `
        SELECT 
            ProductID AS id, 
            ProductName AS name, 
            Brand AS brand, 
            Price AS price 
        FROM Products 
        WHERE IsActive = 1
    `;

    const result = await pool.request().query(query);
    return result.recordset;
};

// --- Complete Appointment ---

// 1. Lấy PatientID từ lịch hẹn (Vì bảng Orders yêu cầu UserID)
const getPatientIdByAppt = async (transaction, appointmentId) => {
    const result = await transaction.request()
        .input('ApptID', sql.Int, appointmentId)
        .query(`SELECT PatientID FROM Appointments WHERE AppointmentID = @ApptID`);

    if (result.recordset.length === 0) throw new Error("Không tìm thấy lịch hẹn");
    return result.recordset[0].PatientID;
};

// 2. Cập nhật trạng thái và ghi chú lịch hẹn
const updateAppointmentStatus = async (transaction, data) => {
    return transaction.request()
        .input('ApptID', sql.Int, data.appointmentId)
        .input('UserID', sql.Int, data.userId)
        .input('MedicalRecord', sql.NVarChar, data.medicalRecord) 
        .input('FUDate', sql.Date, data.followUpDate || null)
        .input('FUNote', sql.NVarChar, data.followUpNote || null)
        .query(`
            UPDATE Appointments 
            SET Status = 'Completed', 
                MedicalRecord = @MedicalRecord,
                FollowUpDate = @FUDate, 
                FollowUpNote = @FUNote, 
                UpdatedAt = GETDATE()
            WHERE AppointmentID = @ApptID 
            AND DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID)
        `);
};

// --- 3. Tạo Đơn hàng và Chi tiết đơn hàng ---
const createOrderForPrescription = async (transaction, patientId, data) => {
    if (!data.products || data.products.length === 0) return null;

    const orderResult = await transaction.request()
        .input('UserID', sql.Int, patientId)
        .input('ApptID', sql.Int, data.appointmentId)
        .query(`
            INSERT INTO Orders (UserID, AppointmentID, TotalAmount, Status, OrderDate)
            OUTPUT INSERTED.OrderID
            VALUES (@UserID, @ApptID, 0, 'Completed', GETDATE())
        `);

    const orderId = orderResult.recordset[0].OrderID;
    let productSum = 0;

    for (const p of data.products) {
        await transaction.request()
            .input('OrderID', sql.Int, orderId)
            .input('ProductID', sql.Int, p.id)
            .input('Quantity', sql.Int, p.qty)
            .input('UnitPrice', sql.Decimal(18, 2), p.price)
            .query(`
                INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice) 
                VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
            `);

        productSum += (p.price * p.qty);
    }

    await transaction.request()
        .input('Total', sql.Decimal(18, 2), productSum)
        .input('OID', sql.Int, orderId)
        .query(`UPDATE Orders SET TotalAmount = @Total WHERE OrderID = @OID`);

    return orderId;
};

// --- 4. Tạo Hóa đơn tổng (Kiểm tra thêm giá trị null cho OrderID) ---
const createFinalInvoice = async (transaction, orderId, data) => {
    return transaction.request()
        .input('ApptID', sql.Int, data.appointmentId)
        .input('OrderID', sql.Int, orderId || null)
        .input('Total', sql.Decimal(18, 2), data.grandTotal)
        .query(`
            INSERT INTO Invoices (AppointmentID, OrderID, TotalAmount, IssuedDate, Status)
            VALUES (@ApptID, @OrderID, @Total, GETDATE(), 'Unpaid')
        `);
};


const completeConsultation = async (data) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const patientId = await getPatientIdByAppt(transaction, data.appointmentId);

        await updateAppointmentStatus(transaction, data);

        const orderId = await createOrderForPrescription(transaction, patientId, data);

        await createFinalInvoice(transaction, orderId, data);

        if (data.followUpDate) {
            const user = await transaction.request()
                .input('UID', sql.Int, patientId)
                .query(`SELECT Email, FullName FROM Users WHERE UserID = @UID`);

            if (user.recordset.length > 0) {
                const { Email, FullName } = user.recordset[0];
                const mailBody = `
                    <h2>Thông báo lịch tái khám</h2>
                    <p>Chào <b>${FullName}</b>,</p>
                    <p>Ca khám của bạn đã hoàn tất. Bác sĩ có lịch hẹn tái khám cho bạn:</p>
                    <ul>
                        <li><b>Ngày tái khám:</b> ${new Date(data.followUpDate).toLocaleDateString('vi-VN')}</li>
                        <li><b>Ghi chú:</b> ${data.followUpNote || 'Không có'}</li>
                    </ul>
                    <p>Trân trọng!</p>
                `;

                sendMail(Email, "[Nha Khoa Smile Sync] Thông báo lịch tái khám", mailBody).catch(e => console.error("Lỗi gửi mail:", e));
            }
        }

        await transaction.commit();
        return { success: true, message: "Hoàn tất ca khám thành công!" };

    } catch (err) {
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error("Lỗi bỏ qua (Rollback failed):", rollbackErr.message);
        }

        console.error("LỖI GỐC TỪ SQL:", err.message);

        throw new Error(err.message);
    }
};

module.exports = { getConsultationDetail, getAvailableProducts, completeConsultation };