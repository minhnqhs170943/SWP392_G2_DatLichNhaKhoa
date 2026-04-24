import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_URL}/doctor-profile`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleAxiosError = (error) => {
    if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Lỗi máy chủ");
    }
    throw new Error("Không thể kết nối đến máy chủ");
};

export const getDoctorProfileApi = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE}/${userId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};


export const updateDoctorProfileApi = async (userId, profileData) => {
    try {
        const response = await axios.put(`${API_BASE}/update`, profileData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const changeDoctorPasswordApi = async (passwordData) => {
    try {
        // Không cần truyền userId trên URL vì Backend đã tự lấy từ Token
        const response = await axios.put(`${API_BASE}/change-password`, passwordData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};