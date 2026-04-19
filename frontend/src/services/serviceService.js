const API_URL = `${process.env.REACT_APP_API_URL}/services`;

export const getAllServicesApi = async () => {
    try {
        const response = await fetch(`${API_URL}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API lấy danh sách dịch vụ:", error);
        return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
};