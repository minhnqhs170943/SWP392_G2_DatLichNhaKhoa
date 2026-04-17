const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Không tìm thấy token hoặc sai định dạng" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SWP392_SECRET_KEY');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.roleId)) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập tài nguyên này" });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };