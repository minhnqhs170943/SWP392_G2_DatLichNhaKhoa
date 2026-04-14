const userModel = require('../models/user.model');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);

        // So sánh password với PasswordHash trong DB của bạn
        if (user && user.PasswordHash === password) {
            // Loại bỏ mật khẩu trước khi gửi về Client
            const { PasswordHash, ...userInfos } = user;
            
            return res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                user: userInfos // Bao gồm RoleID, FullName, v.v.
            });
        }

        res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

module.exports = { login };