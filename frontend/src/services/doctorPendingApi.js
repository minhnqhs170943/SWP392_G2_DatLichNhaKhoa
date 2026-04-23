import axios from 'axios';
const API_BASE = `${process.env.REACT_APP_API_URL}/doctor-pending`;

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

export async function fetchDoctorServices() {
    try {
        const res = await axios.get(`${API_BASE}/services`, { headers: getAuthHeaders() });
        return res.data.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function fetchPendingAppointments(userId, search = '', startDate = '', endDate = '', service = '', page = 1, limit = 5) {
    try {
        const query = new URLSearchParams({ search, startDate, endDate, service, page, limit }).toString();
        const res = await axios.get(`${API_BASE}/${userId}?${query}`, { headers: getAuthHeaders() });
        return res.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function updateAppointmentStatus(appointmentId, statusData) {
    try {
        const res = await axios.put(`${API_BASE}/${appointmentId}/status`, statusData, { 
            headers: getAuthHeaders() 
        });
        return res.data;
    } catch (error) {
        return handleAxiosError(error);
    }
}