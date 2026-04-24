const { sql, connectDB } = require('../config/db');

const getAllReviews = async ({ search = '' }) => {
    const pool = await connectDB();
    const request = pool.request();

    let query = `
        SELECT
            r.ReviewID,
            r.AppointmentID,
            r.Rating,
            r.Comment,
            r.EditCount,
            r.CreatedAt,
            r.UpdatedAt,
            pu.FullName AS UserName,
            du.FullName AS DoctorName,
            d.Specialty
        FROM Reviews r
        JOIN Users pu ON pu.UserID = r.UserID
        JOIN Appointments a ON a.AppointmentID = r.AppointmentID
        JOIN Doctors d ON d.DoctorID = a.DoctorID
        JOIN Users du ON du.UserID = d.UserID
    `;

    if (search && search.trim()) {
        request.input('Search', sql.NVarChar, `%${search.trim()}%`);
        query += `
            WHERE
                pu.FullName LIKE @Search
                OR du.FullName LIKE @Search
                OR r.Comment LIKE @Search
        `;
    }

    query += ` ORDER BY r.CreatedAt DESC`;
    const result = await request.query(query);
    return result.recordset;
};

const deleteReviewById = async (reviewId) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input('ReviewID', sql.Int, reviewId)
        .query(`
            DELETE FROM Reviews
            WHERE ReviewID = @ReviewID;

            SELECT @@ROWCOUNT AS Affected;
        `);

    return result.recordset[0]?.Affected > 0;
};

module.exports = {
    getAllReviews,
    deleteReviewById,
};
