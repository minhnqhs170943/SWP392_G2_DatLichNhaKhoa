const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');
const { transporter } = require('../config/mailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const { sql, poolPromise } = require('../config/db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const otpStorage = new Map();

const login = async (req, res, next) => {
    let { email, password } = req.body;
    email = email ? email.trim() : '';
    password = password ? password.trim() : '';

    if (!email) return res.status(400).json({ success: false, field: 'email', message: "Email không được để trống" });
    if (!password) return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu không được để trống" });

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, field: 'email', message: "Email này không tồn tại trong hệ thống" });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ success: false, field: 'password', message: "Mật khẩu không chính xác" });
        }

        // const isMatch = password === user.Password;
        // if (!isMatch) {
        //     return res.status(401).json({ success: false, field: 'password', message: "Mật khẩu không chính xác" });
        // }

        const { Password, ...userInfos } = user;
        let doctorId = null;

        if (user.RoleID === 2) { 
            const pool = await poolPromise;
            const docResult = await pool.request()
                .input('UserID', sql.Int, user.UserID)
                .query('SELECT DoctorID FROM Doctors WHERE UserID = @UserID');

            if (docResult.recordset.length > 0) {
                doctorId = docResult.recordset[0].DoctorID;
            }
        }

        userInfos.DoctorID = doctorId;

        const token = jwt.sign(
            { userId: user.UserID, roleId: user.RoleID, doctorId: doctorId },
            process.env.JWT_SECRET || 'SWP392_SECRET_KEY',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.status(200).json({ success: true, message: "Đăng nhập thành công", token: token, user: userInfos });
        
    } catch (error) {
        next(error); 
    }
};

const register = async (req, res, next) => {
    let { fullName, email, password, phone, address } = req.body;

    fullName = fullName?.trim() || '';
    email = email?.trim() || '';
    password = password?.trim() || '';
    phone = phone?.trim() || '';
    address = address?.trim() || '';

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!fullName || fullName.length > 255 || !nameRegex.test(fullName)) return res.status(400).json({ success: false, field: 'fullName', message: "Họ và tên không hợp lệ" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return res.status(400).json({ success: false, field: 'email', message: "Email không hợp lệ" });
    const phoneRegex = /^0\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) return res.status(400).json({ success: false, field: 'phone', message: "Số điện thoại không hợp lệ" });
    if (!address || address.length > 255) return res.status(400).json({ success: false, field: 'address', message: "Địa chỉ không hợp lệ" });
    
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!password || password.length < 6 || password.length > 36 || !passRegex.test(password)) {
        return res.status(400).json({ success: false, field: 'password', message: "Mật khẩu phải từ 6-36 ký tự, gồm cả chữ và số" });
    }

    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) return res.status(400).json({ success: false, field: 'email', message: "Email này đã được sử dụng!" });

        const existingPhone = await userModel.findUserByPhone(phone);
        if (existingPhone) return res.status(400).json({ success: false, field: 'phone', message: "Số điện thoại này đã được sử dụng!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = { password: hashedPassword, fullName, email, phone, address };
        await userModel.createUser(newUser);

        res.status(201).json({ success: true, message: "Đăng ký tài khoản thành công!" });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        if (parseInt(req.params.id) !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xem thông tin này" });
        }

        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });

        const { Password, ...userInfos } = user;
        res.status(200).json({ success: true, user: userInfos });
    } catch (error) {
        next(error);
    }
};

const updateProfileById = async (req, res, next) => {
    try {
        if (parseInt(req.params.id) !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền sửa thông tin này" });
        }

        let { fullName, address } = req.body;
        fullName = fullName?.trim() || '';
        address = address?.trim() || '';

        if (!fullName || !address) return res.status(400).json({ success: false, message: "Không được để trống thông tin" });

        const currentData = await userModel.getUserById(req.params.id);
        if (!currentData) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        const finalData = { fullName, phone: currentData.Phone, address };
        await userModel.updateUserProfile(req.params.id, finalData);
        
        res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        if (parseInt(req.params.id) !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Hành động không hợp lệ" });
        }

        let { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu" });

        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

        const isMatch = await bcrypt.compare(oldPassword, user.Password);
        if (!isMatch) {
            return res.status(400).json({ success: false, field: 'oldPassword', message: "Mật khẩu cũ không chính xác" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await userModel.changePassword(req.params.id, hashedNewPassword);
        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    let { email } = req.body;
    email = email?.trim() || '';

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) return res.status(404).json({ success: false, field: 'email', message: "Email này không tồn tại trong hệ thống" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 15 * 60 * 1000;
        otpStorage.set(email, { otp, expiry });

        const mailOptions = {
            from: `"Nha Khoa SMILE SYNC" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác nhận khôi phục mật khẩu',
            html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`
        };

        transporter.sendMail(mailOptions).catch(console.error);
        
        res.status(200).json({ success: true, message: "Mã OTP đã được gửi đến email của bạn" });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    let { email, otp, newPassword } = req.body;
    
    try {
        const record = otpStorage.get(email);
        if (!record || Date.now() > record.expiry || record.otp !== otp) {
            return res.status(400).json({ success: false, field: 'otp', message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }

        const user = await userModel.findUserByEmail(email);
        if(!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await userModel.changePassword(user.UserID, hashedNewPassword);
        
        otpStorage.delete(email); 

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        next(error);
    }
};

const uploadAvatar = async (req, res, next) => {
    try {
        if (parseInt(req.params.id) !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật ảnh này" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh" });
        }

        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "smile_sync_avatars" },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);
        await userModel.updateAvatar(req.params.id, result.secure_url);

        res.status(200).json({ success: true, message: "Cập nhật ảnh đại diện thành công", avatarUrl: result.secure_url });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, register, getProfile, updateProfileById, changePassword, forgotPassword, resetPassword, uploadAvatar };