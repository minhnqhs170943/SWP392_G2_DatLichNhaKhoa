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

const getBannedWords = async ({ search = '' }) => {
    const pool = await connectDB();
    const request = pool.request();
    let query = `
        SELECT id, word, reason, is_active, created_at, updated_at, created_by, updated_by
        FROM banned_words
    `;

    if (search && search.trim()) {
        request.input('Search', sql.NVarChar, `%${search.trim()}%`);
        query += ` WHERE word LIKE @Search OR reason LIKE @Search`;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await request.query(query);
    return result.recordset;
};

const createBannedWord = async ({ word, reason = null, createdBy = null }) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input('word', sql.NVarChar(255), word)
        .input('reason', sql.NVarChar(500), reason)
        .input('createdBy', sql.Int, createdBy)
        .query(`
            INSERT INTO banned_words (word, reason, is_active, created_at, updated_at, created_by, updated_by)
            OUTPUT INSERTED.id, INSERTED.word, INSERTED.reason, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at, INSERTED.created_by, INSERTED.updated_by
            VALUES (@word, @reason, 1, GETDATE(), NULL, @createdBy, NULL)
        `);

    return result.recordset[0] || null;
};

const updateBannedWord = async ({ id, word, reason = null, isActive = true, updatedBy = null }) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .input('word', sql.NVarChar(255), word)
        .input('reason', sql.NVarChar(500), reason)
        .input('isActive', sql.Bit, isActive ? 1 : 0)
        .input('updatedBy', sql.Int, updatedBy)
        .query(`
            UPDATE banned_words
            SET
                word = @word,
                reason = @reason,
                is_active = @isActive,
                updated_at = GETDATE(),
                updated_by = @updatedBy
            WHERE id = @id;

            SELECT @@ROWCOUNT AS Affected;
        `);

    return result.recordset[0]?.Affected > 0;
};

const deleteBannedWord = async (id) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM banned_words
            WHERE id = @id;

            SELECT @@ROWCOUNT AS Affected;
        `);

    return result.recordset[0]?.Affected > 0;
};

module.exports = {
    getAllReviews,
    deleteReviewById,
    getBannedWords,
    createBannedWord,
    updateBannedWord,
    deleteBannedWord,
};

