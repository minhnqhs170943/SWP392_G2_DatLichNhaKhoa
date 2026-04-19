const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchBlogs = async () => {
    const response = await fetch(`${API_URL}/blogs`);
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi lấy danh sách blog');
    }
    return result.data;
};

export const fetchBlogById = async (id) => {
    const response = await fetch(`${API_URL}/blogs/${id}`);
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi lấy thông tin blog');
    }
    return result.data;
};

export const fetchBlogBySlug = async (slug) => {
    const response = await fetch(`${API_URL}/blogs/slug/${slug}`);
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi lấy thông tin blog');
    }
    return result.data;
};

export const fetchBlogsForAdmin = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/blogs/admin/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi lấy danh sách blog');
    }
    return result.data;
};

export const createBlog = async (blogData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi tạo blog');
    }
    return result.data;
};

export const updateBlog = async (id, blogData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi cập nhật blog');
    }
    return result;
};

export const deleteBlog = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Lỗi khi xóa blog');
    }
    return result;
};
