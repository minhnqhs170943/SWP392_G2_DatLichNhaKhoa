const API_BASE = `${process.env.REACT_APP_API_URL}/doctor-dashboard`;

export async function fetchDoctorDashboard(userId, filterMode, startDate, endDate) {
    const query = new URLSearchParams({ filterMode, startDate, endDate }).toString();
    const res = await fetch(`${API_BASE}/${userId}?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi tải dữ liệu dashboard");
    return data;
}

export async function updateAppointmentStatus(appointmentId, statusData) {
  const res = await fetch(`${API_BASE}/status/${appointmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi cập nhật trạng thái lịch hẹn");
  return data;
}