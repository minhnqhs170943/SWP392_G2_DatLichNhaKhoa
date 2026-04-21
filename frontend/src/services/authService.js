const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/auth`;

export const loginApi = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi gọi API đăng nhập:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

export const registerApi = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API đăng ký:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

export const getProfileApi = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API lấy thông tin người dùng:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

export const updateProfileApi = async (userId, profileData) => {
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(profileData),
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API cập nhật thông tin người dùng:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

export const changePasswordApi = async (userId, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/change-password/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword }),
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API đổi mật khẩu:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

export const forgotPasswordApi = async (email) => {
    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: "Lỗi kết nối máy chủ" };
    }
};

export const resetPasswordApi = async (email, otp, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: "Lỗi kết nối máy chủ" };
    }
};