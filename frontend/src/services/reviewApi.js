const API_BASE = process.env.REACT_APP_API_URL;

export async function fetch5LastestReviews() {
  const res = await fetch(`${API_BASE}/reviews`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách đánh giá mới nhất");
  return data.data || [];
}

export async function fetchAllAppointments(userId) {
  const res = await fetch(`${API_BASE}/reviews/appointment/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách đánh giá mới nhất");
  return data.data || [];
}



