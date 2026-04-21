const { sql, connectDB } = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
const register = async (req, res) => {
    const { FullName, Email, Phone, Password, ConfirmPassword } = req.body;

    if (!FullName || !Email || !Phone || !Password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (!isValidEmail(Email)) {
        return res.status(400).json({ success: false, message: 'Email không đúng định dạng.' });
    }
    if (!isValidPhone(Phone)) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03/05/07/08/09).' });
    }
    if (Password.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }
    if (ConfirmPassword && Password !== ConfirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
    }

    try {
        const pool = await connectDB();

        const checkEmail = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`SELECT UserID FROM Users WHERE Email = @Email`);

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký. Vui lòng dùng email khác.' });
        }

        const PasswordHash = await bcrypt.hash(Password, SALT_ROUNDS);

        const result = await pool.request()
            .input('RoleID', sql.Int, 3) // default: Patient
            .input('PasswordHash', sql.VarChar, PasswordHash)
            .input('FullName', sql.NVarChar, FullName)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .query(`
                INSERT INTO Users (RoleID, PasswordHash, FullName, Email, Phone, IsActive, CreatedAt)
                OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email, INSERTED.Phone, INSERTED.RoleID
                VALUES (@RoleID, @PasswordHash, @FullName, @Email, @Phone, 1, GETDATE())
            `);

        const newUser = result.recordset[0];
        res.status(201).json({ success: true, message: 'Đăng ký thành công!', payload: newUser });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký.' });
    }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`
                SELECT u.UserID, u.FullName, u.Email, u.Phone, u.PasswordHash,
                       u.RoleID, r.RoleName, u.IsActive, u.AvatarURL
                FROM Users u
                JOIN Roles r ON u.RoleID = r.RoleID
                WHERE u.Email = @Email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = result.recordset[0];

        if (!user.IsActive) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá. Vui lòng liên hệ admin.' });
        }

        const isMatch = await bcrypt.compare(Password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
        }

        const { PasswordHash, ...userInfo } = user;

        res.status(200).json({ success: true, message: 'Đăng nhập thành công!', payload: userInfo });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập.' });
    }
};

module.exports = { register, login };
