const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Lấy danh sách thông báo của user
export const getUserNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch notifications:', response.status);
            return [];
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return 0;
    }

    try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch unread count:', response.status);
            return 0;
        }

        const data = await response.json();
        return data.data?.count || 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

// Đánh dấu thông báo đã đọc
export const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User not logged in');
    }

    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to mark notification as read');
    }

    return await response.json();
};

// Đánh dấu tất cả đã đọc
export const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User not logged in');
    }

    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
    }

    return await response.json();
};
