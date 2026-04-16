const userModel = require('../models/user.model');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);

        if (user && user.PasswordHash === password) {
            const { PasswordHash, ...userInfos } = user;
            
            return res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                user: userInfos
            });
        }

        res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

const register = async (req, res) => {
    const { fullName, email, password, phone, address } = req.body;

    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
        }

        const username = email.split('@')[0];

        const newUser = {
            username: username,
            passwordHash: password,
            fullName: fullName,
            email: email,
            phone: phone || '',
            address: address || ''
        };

        await userModel.createUser(newUser);

        res.status(201).json({ success: true, message: "Đăng ký tài khoản thành công!" });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký" });
    }
};

module.exports = { login, register };