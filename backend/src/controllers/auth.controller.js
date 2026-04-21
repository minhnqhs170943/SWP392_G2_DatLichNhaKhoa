const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    let { email, password } = req.body;

    email = email ? email.trim() : '';
    password = password ? password.trim() : '';

    if (!email) {
        return res.status(400).json({ success: false, field: 'email', message: "Email không được để trống" });
    }
    if (!password) {
        return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu không được để trống" });
    }

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
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

const register = async (req, res) => {
    let { fullName, email, password, phone, address } = req.body;

    fullName = fullName ? fullName.trim() : '';
    email = email ? email.trim() : '';
    password = password ? password.trim() : '';
    phone = phone ? phone.trim() : '';
    address = address ? address.trim() : '';

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!fullName) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không được để trống" });
    if (fullName.length > 255) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không vượt quá 255 ký tự" });
    if (!nameRegex.test(fullName)) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không được chứa số hoặc ký tự đặc biệt" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return res.status(400).json({ success: false, field: 'email', message: "Email không được để trống" });
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, field: 'email', message: "Định dạng email không hợp lệ" });

    const phoneRegex = /^0\d{9}$/;
    if (!phone) return res.status(400).json({ success: false, field: 'phone', message: "Số điện thoại không được để trống" });
    if (!phoneRegex.test(phone)) return res.status(400).json({ success: false, field: 'phone', message: "Số điện thoại không hợp lệ" });

    if (!address) return res.status(400).json({ success: false, field: 'address', message: "Địa chỉ không được để trống" });
    if (address.length > 255) return res.status(400).json({ success: false, field: 'address', message: "Địa chỉ không vượt quá 255 ký tự" });

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!password) return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu không được để trống" });
    if (password.length < 6 || password.length > 36) return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu phải từ 6 đến 36 ký tự" });
    if (!passRegex.test(password)) return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số" });

    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, field: 'email', message: "Email này đã được sử dụng!" });
        }

        const existingPhone = await userModel.findUserByPhone(phone);
        if (existingPhone) {
            return res.status(400).json({ success: false, field: 'phone', message: "Số điện thoại này đã được sử dụng!" });
        }

        const newUser = {
            password: password,
            fullName: fullName,
            email: email,
            phone: phone,
            address: address
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
    let { fullName, address } = req.body;

    fullName = fullName ? fullName.trim() : '';
    address = address ? address.trim() : '';

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!fullName) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không được để trống" });
    if (fullName.length > 255) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không vượt quá 255 ký tự" });
    if (!nameRegex.test(fullName)) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không được chứa số hoặc ký tự đặc biệt" });

    if (!address) return res.status(400).json({ success: false, field: 'address', message: "Địa chỉ không được để trống" });
    if (address.length > 255) return res.status(400).json({ success: false, field: 'address', message: "Địa chỉ không vượt quá 255 ký tự" });

    try {
        const currentData = await userModel.getUserById(userId);
        if (!currentData) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        const finalData = {
            fullName: fullName,
            phone: currentData.Phone,
            address: address
        };

        await userModel.updateUserProfile(userId, finalData);
        res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

const changePassword = async (req, res) => {
    const userId = req.params.id;
    let { oldPassword, newPassword } = req.body;

    if (!oldPassword) {
        return res.status(400).json({ success: false, field: 'oldPassword', message: "Vui lòng nhập mật khẩu cũ" });
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!newPassword) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu mới không được để trống" });
    }
    if (newPassword.length < 6 || newPassword.length > 36) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu mới phải từ 6 đến 36 ký tự" });
    }
    if (!passRegex.test(newPassword)) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số" });
    }
    if (oldPassword === newPassword) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
    }

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
    let { email } = req.body;
    email = email ? email.trim() : '';

    if (!email) {
        return res.status(400).json({ success: false, field: 'email', message: "Email không được để trống" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, field: 'email', message: "Định dạng email không hợp lệ" });
    }

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, field: 'email', message: "Email này không tồn tại trong hệ thống" });
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
    let { email, otp, newPassword } = req.body;
    email = email ? email.trim() : '';
    newPassword = newPassword ? newPassword.trim() : '';

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!newPassword) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu mới không được để trống" });
    }
    if (newPassword.length < 6 || newPassword.length > 36) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu phải từ 6 đến 36 ký tự" });
    }
    if (!passRegex.test(newPassword)) {
        return res.status(400).json({ success: false, field: 'newPassword', message: "Mật khẩu phải chứa cả chữ cái và chữ số" });
    }

    try {
        const record = otpStorage.get(email);
        if (!record || Date.now() > record.expiry || record.otp !== otp) {
            return res.status(400).json({ success: false, field: 'otp', message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }

        const user = await userModel.findUserByEmail(email);
        await userModel.changePassword(user.UserID, newPassword);
        otpStorage.delete(email);

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

module.exports = { login, register, getProfile, updateProfileById, changePassword, forgotPassword, resetPassword };