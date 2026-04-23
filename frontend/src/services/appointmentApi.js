const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo lịch hẹn mới (Customer booking)
export async function createAppointment(data) {
    const res = await fetch(`${API_BASE}/appointments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi tạo lịch hẹn');
    return result;
}

// Lấy lịch sử lịch hẹn của customer
export async function getMyAppointments(userId) {
    const res = await fetch(`${API_BASE}/appointments/my/${userId}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi lấy lịch sử');
    return result.data || [];
}

// Lấy chi tiết lịch hẹn
export async function getAppointmentDetail(appointmentId) {
    const res = await fetch(`${API_BASE}/appointments/detail/${appointmentId}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi lấy chi tiết');
    return result.data;
}

// Hủy lịch hẹn
export async function cancelAppointment(appointmentId) {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi hủy lịch');
    return result;
}
