const consultationDetail = require('../../models/Doctor/consultationDetail.model');

const getConsultationDetail = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.userId;

        if (!appointmentId || !userId) {
            return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ hoặc bạn không phải bác sĩ' });
        }

        const data = await consultationDetail.getConsultationDetail(appointmentId, userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const data = await consultationDetail.getAvailableProducts();
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

const completeConsultation = async (req, res, next) => {
    try {
        const { appointmentId, medicalRecord, products, followUpDate, followUpNote, grandTotal } = req.body;
        const userId = req.user.userId;

        if (!appointmentId || !medicalRecord || medicalRecord.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ Hồ sơ bệnh án."
            });
        }

        const result = await consultationDetail.completeConsultation({
            appointmentId,
            userId,
            medicalRecord,
            products,
            followUpDate,
            followUpNote,
            grandTotal
        });

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

module.exports = { getConsultationDetail, getProducts, completeConsultation };