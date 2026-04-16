const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);

        if (user && user.PasswordHash === password) {
            const { PasswordHash, ...userInfos } = user;

            const token = jwt.sign(
                { userId: user.UserID, roleId: user.RoleID },
                process.env.JWT_SECRET || 'SWP392_SECRET_KEY',
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                token: token,
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

        const newUser = {
            password: password,
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

const getProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        const { PasswordHash, ...userInfos } = user;
        res.status(200).json({ success: true, user: userInfos });

    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy thông tin người dùng" });
    }
};

const updateProfileById = async (req, res) => {
    const userId = req.params.id;
    const newData = req.body;

    try {
        const currentData = await userModel.getUserById(userId);
        if (!currentData) return res.status(404).json({ message: "Không tìm thấy user" });

        const finalData = {
            fullName: newData.fullName !== undefined ? newData.fullName : currentData.FullName,
            phone: newData.phone !== undefined ? newData.phone : currentData.Phone,
            address: newData.address !== undefined ? newData.address : currentData.Address
        };

        await userModel.updateUserProfile(userId, finalData);

        res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

const changePassword = async (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;

    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

        const currentPassword = user.PasswordHash;
        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
        }

        await userModel.changePassword(userId, newPassword);

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};


const otpStorage = new Map();

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "Email không tồn tại trong hệ thống" });
        }

        // Tạo OTP 6 số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Cài đặt thời gian hết hạn là 15 phút
        const expiry = Date.now() + 15 * 60 * 1000; 

        // Lưu OTP vào bộ nhớ tạm
        otpStorage.set(email, { otp, expiry });

        const mailOptions = {
            from: `"Nha Khoa SMILE SYNC" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác nhận khôi phục mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3 style="color: #1a237e;">Xin chào ${user.FullName || 'bạn'},</h3>
                    <p>Bạn vừa yêu cầu khôi phục mật khẩu tại Nha Khoa Smile Sync.</p>
                    <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #2563eb; letter-spacing: 2px;">${otp}</b></p>
                    <p style="color: #e11d48;">Mã này sẽ hết hạn trong vòng 15 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Mã OTP đã được gửi đến email của bạn" });
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi gửi email" });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });

        // Lấy thông tin OTP từ bộ nhớ tạm ra để đối chiếu
        const record = otpStorage.get(email);

        if (!record) {
            return res.status(400).json({ success: false, message: "Mã OTP không tồn tại hoặc chưa được gửi" });
        }
        if (Date.now() > record.expiry) {
            otpStorage.delete(email); 
            return res.status(400).json({ success: false, message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: "Mã OTP không chính xác" });
        }

        await userModel.changePassword(user.UserID, newPassword);
        
        // Xóa OTP khỏi RAM sau khi dùng thành công
        otpStorage.delete(email);

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi Reset Password:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

module.exports = { login, register, getProfile, updateProfileById, changePassword, forgotPassword, resetPassword };