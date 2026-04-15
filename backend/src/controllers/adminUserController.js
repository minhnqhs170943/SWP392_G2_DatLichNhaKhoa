const { sql, connectDB } = require('../config/db');

// @desc    Lấy tất cả người dùng
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone, u.Address,
                   u.RoleID, r.RoleName, u.IsActive, u.CreatedAt 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            ORDER BY u.CreatedAt DESC
        `);
        
        // Ensure IsActive is boolean for frontend if it comes as bit
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
    const { Username, FullName, Email, Phone, RoleID, IsActive } = req.body;
    
    // Default mock password for admin created users: '123456'
    // Ideally this should be hashed via bcrypt
    const PasswordHash = 'mock_hashed_password'; 
    const isActiveBit = IsActive ? 1 : 0;

    try {
        const pool = await connectDB();
        
        // Kiểm tra xem Username hoặc Email đã tồn tại chưa
        const checkUser = await pool.request()
            .input('Username', sql.VarChar, Username)
            .input('Email', sql.VarChar, Email)
            .query(`SELECT UserID FROM Users WHERE Username = @Username OR (Email IS NOT NULL AND Email = @Email)`);
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email đã tồn tại.' });
        }

        const result = await pool.request()
            .input('RoleID', sql.Int, RoleID)
            .input('Username', sql.VarChar, Username)
            .input('PasswordHash', sql.VarChar, PasswordHash)
            .input('FullName', sql.NVarChar, FullName)
            .input('Email', sql.VarChar, Email || null)
            .input('Phone', sql.VarChar, Phone)
            .input('IsActive', sql.Bit, isActiveBit)
            .query(`
                INSERT INTO Users (RoleID, Username, PasswordHash, FullName, Email, Phone, IsActive, CreatedAt)
                OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.FullName, INSERTED.Email, INSERTED.Phone, INSERTED.RoleID, INSERTED.IsActive, INSERTED.CreatedAt
                VALUES (@RoleID, @Username, @PasswordHash, @FullName, @Email, @Phone, @IsActive, GETDATE())
            `);

        const newUser = result.recordset[0];
        // Fetch RoleName just to return full object
        const roleResult = await pool.request().input('RoleID', sql.Int, RoleID).query(`SELECT RoleName FROM Roles WHERE RoleID = @RoleID`);
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
    const { FullName, Email, Phone, RoleID, IsActive } = req.body;
    const isActiveBit = IsActive ? 1 : 0;

    try {
        const pool = await connectDB();

        // Kiểm tra xem Id có tồn tại không
        const checkExist = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`SELECT UserID FROM Users WHERE UserID = @UserID`);
            
        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        await pool.request()
            .input('UserID', sql.Int, id)
            .input('RoleID', sql.Int, RoleID)
            .input('FullName', sql.NVarChar, FullName)
            .input('Email', sql.VarChar, Email || null)
            .input('Phone', sql.VarChar, Phone)
            .input('IsActive', sql.Bit, isActiveBit)
            .query(`
                UPDATE Users 
                SET RoleID = @RoleID, FullName = @FullName, Email = @Email, Phone = @Phone, IsActive = @IsActive
                WHERE UserID = @UserID
            `);

        // Get updated user data with role
        const updatedResult = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`
                SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone, 
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
        
        // Kiểm tra xem Id có tồn tại không
        const checkExist = await pool.request()
            .input('UserID', sql.Int, id)
            .query(`SELECT UserID, IsActive FROM Users WHERE UserID = @UserID`);
            
        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Soft delete: set IsActive = 0
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
