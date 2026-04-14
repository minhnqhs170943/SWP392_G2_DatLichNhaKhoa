const API_URL = 'http://localhost:5000/api/auth';

export const loginApi = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi gọi API đăng nhập:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};

