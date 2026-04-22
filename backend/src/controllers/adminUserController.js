const { sql, connectDB } = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Validate phone: Vietnamese format (10 digits, starts with 03/05/07/08/09)
const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

// Validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Lấy tất cả người dùng (có hỗ trợ search)
// @route   GET /api/admin/users?search=...
const getUsers = async (req, res) => {
    const { search } = req.query;
    try {
        const pool = await connectDB();
        let query = `
            SELECT u.UserID, u.FullName, u.Email, u.Phone, u.Address,
                   u.RoleID, r.RoleName, u.IsActive, u.CreatedAt
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
        `;

        const request = pool.request();

        if (search && search.trim() !== '') {
            const keyword = `%${search.trim()}%`;
            request.input('search', sql.NVarChar, keyword);
            query += ` WHERE u.FullName LIKE @search OR u.Email LIKE @search OR u.Phone LIKE @search`;
        }

        query += ` ORDER BY u.CreatedAt DESC`;

        const result = await request.query(query);

        const users = result.recordset.map(user => ({
            ...user,
            IsActive: user.IsActive === 1 || user.IsActive === true
        }));

        res.status(200).json({ success: true, payload: users });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy người dùng' });
    }
};

// @desc    Tạo người dùng mới
// @route   POST /api/admin/users
const createUser = async (req, res) => {
    const { FullName, Email, Phone, Address, RoleID, IsActive, Password } = req.body;

    // Validate
    if (!FullName || !Email || !Phone || !Password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }
    if (!isValidEmail(Email)) {
        return res.status(400).json({ success: false, message: 'Email không đúng định dạng.' });
    }
    if (!isValidPhone(Phone)) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03/05/07/08/09).' });
    }

    const isActiveBit = IsActive ? 1 : 0;
    const roleIdInt = parseInt(RoleID) || 3;

    try {
        const pool = await connectDB();

        // Kiểm tra email đã tồn tại chưa
        const checkEmail = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`SELECT UserID FROM Users WHERE Email = @Email`);

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký. Vui lòng dùng email khác.' });
        }

        const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);

        const result = await pool.request()
            .input('RoleID', sql.Int, roleIdInt)
            .input('Password', sql.VarChar, hashedPassword)
            .input('FullName', sql.NVarChar, FullName)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .input('Address', sql.NVarChar, Address || null)
            .input('IsActive', sql.Bit, isActiveBit)
            .query(`
                INSERT INTO Users (RoleID, Password, FullName, Email, Phone, Address, IsActive, CreatedAt)
                OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email, INSERTED.Phone, INSERTED.Address, INSERTED.RoleID, INSERTED.IsActive, INSERTED.CreatedAt
                VALUES (@RoleID, @Password, @FullName, @Email, @Phone, @Address, @IsActive, GETDATE())
            `);

        const newUser = result.recordset[0];
        const roleResult = await pool.request()
            .input('RoleID', sql.Int, roleIdInt)
            .query(`SELECT RoleName FROM Roles WHERE RoleID = @RoleID`);
        newUser.RoleName = roleResult.recordset[0]?.RoleName;
        newUser.IsActive = newUser.IsActive === 1 || newUser.IsActive === true;

        res.status(201).json({ success: true, payload: newUser, message: 'Thêm người dùng thành công' });
    } catch (error) {
        console.error("Lỗi khi thêm người dùng:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thêm người dùng' });
    }
};

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { FullName, Email, Phone, Address, RoleID, IsActive, Password } = req.body;

    // Validate
    if (!FullName || !Email || !Phone) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }
    if (!isValidEmail(Email)) {
        return res.status(400).json({ success: false, message: 'Email không đúng định dạng.' });
    }
    if (!isValidPhone(Phone)) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03/05/07/08/09).' });
    }

    const isActiveBit = IsActive ? 1 : 0;
    const roleIdInt = parseInt(RoleID) || 3;

    try {
        const pool = await connectDB();

        const checkExist = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`SELECT UserID FROM Users WHERE UserID = @UserID`);

        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra email trùng với user khác
        const checkEmail = await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('UserID', sql.Int, id)
            .query(`SELECT UserID FROM Users WHERE Email = @Email AND UserID != @UserID`);

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được dùng bởi tài khoản khác.' });
        }

        const request = pool.request()
            .input('UserID', sql.Int, id)
            .input('RoleID', sql.Int, roleIdInt)
            .input('FullName', sql.NVarChar, FullName)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .input('Address', sql.NVarChar, Address || null)
            .input('IsActive', sql.Bit, isActiveBit);

        let updateQuery = `
            UPDATE Users
            SET RoleID = @RoleID, FullName = @FullName, Email = @Email,
                Phone = @Phone, Address = @Address, IsActive = @IsActive
        `;

        // Nếu có password mới thì cập nhật luôn
        if (Password && Password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);
            request.input('Password', sql.VarChar, hashedPassword);
            updateQuery += `, Password = @Password`;
        }

        updateQuery += ` WHERE UserID = @UserID`;
        await request.query(updateQuery);

        const updatedResult = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`
                SELECT u.UserID, u.FullName, u.Email, u.Phone, u.Address,
                       u.RoleID, r.RoleName, u.IsActive, u.CreatedAt
                FROM Users u
                JOIN Roles r ON u.RoleID = r.RoleID
                WHERE u.UserID = @UserID
            `);

        const updatedUser = updatedResult.recordset[0];
        updatedUser.IsActive = updatedUser.IsActive === 1 || updatedUser.IsActive === true;

        res.status(200).json({ success: true, payload: updatedUser, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật người dùng' });
    }
};

// @desc    Xóa mềm người dùng (Khoá tài khoản)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectDB();

        const checkExist = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`SELECT UserID, IsActive FROM Users WHERE UserID = @UserID`);

        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        await pool.request()
            .input('UserID', sql.Int, id)
            .query(`UPDATE Users SET IsActive = 0 WHERE UserID = @UserID`);

        res.status(200).json({ success: true, message: 'Khoá người dùng thành công' });
    } catch (error) {
        console.error("Lỗi khi xoá/khoá người dùng:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thao tác' });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
