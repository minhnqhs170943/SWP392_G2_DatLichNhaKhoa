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

export async function fetchBannedWords(search = '') {
    const url = `${API_BASE}/admin/reviews/banned-words${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    const res = await fetch(url);
    const data = await handleResponse(res, 'Lỗi lấy danh sách từ cấm');
    return data.data || [];
}

export async function createBannedWord(payload) {
    const res = await fetch(`${API_BASE}/admin/reviews/banned-words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res, 'Lỗi thêm từ cấm');
}

export async function updateBannedWord(id, payload) {
    const res = await fetch(`${API_BASE}/admin/reviews/banned-words/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res, 'Lỗi cập nhật từ cấm');
}

export async function deleteBannedWord(id) {
    const res = await fetch(`${API_BASE}/admin/reviews/banned-words/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res, 'Lỗi xóa từ cấm');
}

