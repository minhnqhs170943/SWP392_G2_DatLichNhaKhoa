const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export async function fetchDoctors() {
  const res = await fetch(`${API_BASE}/doctors`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách bác sĩ");
  return data.data || [];
}

export async function fetchDoctorById(id) {
  const res = await fetch(`${API_BASE}/doctors/detail/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy chi tiết bác sĩ");
  return data.data;
}

export async function fetchAllServices() {
  const res = await fetch(`${API_BASE}/services`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách dịch vụ");
  return data.services || data.data || [];
}
