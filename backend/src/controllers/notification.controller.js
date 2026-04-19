const notificationModel = require('../models/notification.model');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await notificationModel.getUserNotifications(userId);
        
        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const affected = await notificationModel.markAsRead(parseInt(id), userId);
        
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu đã đọc'
        });
    } catch (error) {
        console.error('Mark As Read Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await notificationModel.markAllAsRead(userId);
        
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả đã đọc'
        });
    } catch (error) {
        console.error('Mark All As Read Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await notificationModel.getUnreadCount(userId);
        
        return res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get Unread Count Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
