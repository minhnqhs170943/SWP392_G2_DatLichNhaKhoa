const API_BASE = process.env.REACT_APP_API_URL;

async function handleResponse(res, fallbackMessage) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || fallbackMessage);
    }
    return data;
}

export async function fetchAdminReviews(search = '') {
    const url = `${API_BASE}/admin/reviews${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    const res = await fetch(url);
    const data = await handleResponse(res, 'Lỗi lấy danh sách review');
    return data.data || [];
}

export async function deleteAdminReview(reviewId) {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
    });
    return handleResponse(res, 'Lỗi xóa review');
}
