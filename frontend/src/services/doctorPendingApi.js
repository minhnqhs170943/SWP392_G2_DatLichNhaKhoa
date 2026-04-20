const API_BASE = `${process.env.REACT_APP_API_URL}/doctor-pending`;

export async function fetchDoctorServices() {
    const res = await fetch(`${API_BASE}/services`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi tải dịch vụ");
    return data.data;
}

export async function fetchPendingAppointments(userId, search = '', startDate = '', endDate = '', service = '', page = 1, limit = 5) {
    const query = new URLSearchParams({ search, startDate, endDate, service, page, limit }).toString();
    const res = await fetch(`${API_BASE}/${userId}?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi tải danh sách lịch chờ duyệt");
    return data;
}

export async function updateAppointmentStatus(appointmentId, statusData) {
    const res = await fetch(`${API_BASE}/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi cập nhật trạng thái");
    return data;
}