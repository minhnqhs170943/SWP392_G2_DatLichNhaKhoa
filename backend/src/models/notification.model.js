const { sql } = require('../config/db');

const createNotification = async ({ userId, title, message, type, referenceId }) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    request.input('title', sql.NVarChar(255), title);
    request.input('message', sql.NVarChar(sql.MAX), message);
    request.input('type', sql.NVarChar(50), type);
    request.input('referenceId', sql.Int, referenceId || null);

    const result = await request.query(`
        INSERT INTO [dbo].[Notifications] (UserID, Title, Message, Type, ReferenceID, IsRead, CreatedAt)
        OUTPUT INSERTED.NotificationID
        VALUES (@userId, @title, @message, @type, @referenceId, 0, GETDATE())
    `);

    return result.recordset[0]?.NotificationID;
};

const getUserNotifications = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);

    const result = await request.query(`
        SELECT 
            NotificationID,
            Title,
            Message,
            Type,
            ReferenceID,
            IsRead,
            CreatedAt
        FROM [dbo].[Notifications]
        WHERE UserID = @userId
        ORDER BY CreatedAt DESC
    `);

    return result.recordset;
};

const markAsRead = async (notificationId, userId) => {
    const request = new sql.Request();
    request.input('notificationId', sql.Int, notificationId);
    request.input('userId', sql.Int, userId);

    const result = await request.query(`
        UPDATE [dbo].[Notifications]
        SET IsRead = 1
        WHERE NotificationID = @notificationId AND UserID = @userId
    `);

    return result.rowsAffected[0] || 0;
};

const markAllAsRead = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);

    const result = await request.query(`
        UPDATE [dbo].[Notifications]
        SET IsRead = 1
        WHERE UserID = @userId AND IsRead = 0
    `);

    return result.rowsAffected[0] || 0;
};

const getUnreadCount = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);

    const result = await request.query(`
        SELECT COUNT(*) as UnreadCount
        FROM [dbo].[Notifications]
        WHERE UserID = @userId AND IsRead = 0
    `);

    return result.recordset[0]?.UnreadCount || 0;
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
