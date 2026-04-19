const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchLatestReviews( ) {
  const res = await fetch(`${API_BASE}/reviews`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách đánh giá mới nhất");
  return data.data || [];
}

export async function fetchEligibleAppointments(userId) {
  const res = await fetch(`${API_BASE}/reviews/eligible/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách lịch hẹn có thể đánh giá");
  return data.data || [];
}

export async function createReview(payload) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tạo đánh giá");
  return data;
}

export async function updateReview(appointmentId, payload) {
  const res = await fetch(`${API_BASE}/reviews/${appointmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi cập nhật đánh giá");
  return data;
}

// Backward-compatible names for existing imports
export async function fetch5LastestReviews() {
  return fetchLatestReviews(5);
}

export async function fetchAllAppointments(userId) {
  return fetchEligibleAppointments(userId);
}

