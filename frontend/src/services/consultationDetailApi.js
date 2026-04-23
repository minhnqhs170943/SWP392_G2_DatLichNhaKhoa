import axios from 'axios';
const API_BASE = `${process.env.REACT_APP_API_URL}/consultation-detail`;

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

export const getConsultationDetail = async (appointmentId) => {
    try {
        const response = await axios.get(`${API_BASE}/${appointmentId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getAvailableProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE}/products/all`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const completeConsultation = async (data) => {
    try {
        const response = await axios.post(`${API_BASE}/complete`, data, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};