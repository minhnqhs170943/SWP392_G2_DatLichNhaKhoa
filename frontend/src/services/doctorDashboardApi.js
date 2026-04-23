import axios from 'axios';
const API_BASE = `${process.env.REACT_APP_API_URL}/doctor-dashboard`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleAxiosError = (error) => {
    if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Lỗi từ máy chủ");
    }
    throw new Error("Không thể kết nối đến máy chủ");
};

export async function fetchDoctorDashboard(userId, filterMode, startDate, endDate) {
    try {
        const query = new URLSearchParams({ filterMode, startDate, endDate }).toString();
        const response = await axios.get(`${API_BASE}/${userId}?${query}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function updateAppointmentStatus(appointmentId, statusData) {
    try {
        const response = await axios.put(`${API_BASE}/status/${appointmentId}`, statusData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}