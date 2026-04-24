import axios from 'axios';
const API_URL = `${process.env.REACT_APP_API_URL}/auth`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleAxiosError = (error) => {
    if (error.response && error.response.data) {
        const backendError = error.response.data;

        if (error.response.status === 401 || error.response.status === 403) {
            if (backendError.message === "Token không hợp lệ hoặc đã hết hạn" || 
                backendError.message === "Không tìm thấy token hoặc sai định dạng") {
                
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('authChange'));
                window.location.href = '/login'; 
                
                return { success: false, message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" };
            }
        }

        return backendError;
    }
    return { success: false, message: "Không thể kết nối đến máy chủ" };
};

export const loginApi = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const registerApi = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getProfileApi = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/profile/${userId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const updateProfileApi = async (userId, profileData) => {
    try {
        const response = await axios.put(`${API_URL}/profile/${userId}`, profileData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const changePasswordApi = async (userId, payload) => {
    try {
        const response = await axios.put(`${API_URL}/change-password/${userId}`, payload, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const forgotPasswordApi = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const resetPasswordApi = async (email, otp, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const uploadAvatarApi = async (userId, file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file); 

        const response = await axios.put(`${API_URL}/profile/${userId}/avatar`, formData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};