import axios from 'axios';
const API_BASE = `${process.env.REACT_APP_API_URL}/consultation-history`;

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

export async function fetchConsultationHistory(userId, search = '', startDate = '', endDate = '', status = '', page = 1, limit = 5) {
    try {
        const query = new URLSearchParams({ search, startDate, endDate, status, page, limit }).toString();
        const res = await axios.get(`${API_BASE}/${userId}?${query}`, { headers: getAuthHeaders() });
        return res.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function fetchConsultationStatuses() {
    try {
        const res = await axios.get(`${API_BASE}/statuses`, { headers: getAuthHeaders() });
        return res.data.data || [];
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function fetchHistoryDetail(appointmentId) {
    try {
        const res = await axios.get(`${API_BASE}/detail/${appointmentId}`, { headers: getAuthHeaders() });
        return res.data.data || null;
    } catch (error) {
        return handleAxiosError(error);
    }
}