# Hướng Dẫn Cập Nhật Chức Năng Admin & Fix Lỗi Đồng Bộ
*File này chứa danh sách các thay đổi để bạn copy code và file mới sang project nhận.*

## I. Cập Nhật Cấu Hình Database & Lỗi Khởi Động
*Đảm bảo Backend kết nối đúng đến Database và chạy mượt mà*

**1. `backend/src/config/db.js`**
Chỉnh lại config đọc tên biến từ `.env`:
```javascript
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'master', // CÓ SỬA: Đọc từ DB_NAME
    // ...
```

## II. Sửa Lỗi Đăng Nhập & Mật Khẩu (Do đổi Tên Cột PasswordHash)
*Trường hợp Login báo 401 Unauthorized do Schema DB thay đổi từ `Password` ➔ `PasswordHash`*

**1. `backend/src/models/user.model.js`**
Đổi lại toàn bộ biến khai báo cột `Password` thành `PasswordHash`. Cụ thể:
- Hàm `createUser`: `INSERT INTO Users (RoleID, PasswordHash....`
- Hàm `changePassword`: `UPDATE Users SET PasswordHash = @newPassword...`

**2. `backend/src/controllers/auth.controller.js`**
- Trong hàm `login`: Chỉnh logic check thành: `if (user && user.PasswordHash === password)`
- Trong hàm `changePassword`: Đổi tham chiếu mật khẩu `const currentPassword = user.PasswordHash;`

## III. Fix Lỗi Upload Ảnh Quản Lý Sản Phẩm (Role Admin)
*Tránh lỗi upload mảng bộ đệm không đọc được file hoặc sập ứng dụng API admin/products*

**1. `backend/src/routes/productRoutes.js`**
Chỉnh sửa lại file middleware upload để không báo lỗi undefinded:
```javascript
const upload = require('../middlewares/upload.middleware'); // SỬA DÒNG NÀY
```

**2. `backend/src/controllers/productController.js`**
Cập nhật xử lý ảnh từ memory storage buffer cho các hàm `createProduct` và `updateProduct`. Copy đè đoạn xử lý `cloudinary` bằng `base64`.
Ví dụ đoạn logic thêm cho cả 2 hàm:
```javascript
if (req.file) {
    try {
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(base64, { folder: "nhakhoa_products", resource_type: "image" });
        imageURL = uploadResult.secure_url;
    } catch(err) {
        console.error("Lỗi upload:", err);
    }
}
```

## IV. Bổ Sung Các Tính Năng Quản Lý Mới Cho Admin
*(Copy trực tiếp các file mới dưới đây được tôi gán từ phần việc nay)*

**1. Thêm & Kích Hoạt API (Toàn bộ các file Routing/Controller mới Backend)**
Lấy file mới mà đồng đội đang thiếu:
- `backend/src/models/service.model.js` (Thêm mới CRUD Services)
- `backend/src/controllers/servies.controller.js`
- `backend/src/models/adminStatsController.js` (Cập nhật logic `PatientID` chỉ đếm khi hẹn `Completed`)

Sửa `backend/src/routes/index.js` thêm Route Admin:
```javascript
const adminProductRoutes = require('./productRoutes');
router.use('/admin/products', adminProductRoutes);
router.use('/admin/analytics', require('./adminStatsRoutes'));
```

**2. Copy Giao Diện Các Trang Mới (Frontend)**
Chép nguyên 3 folder/file trang mới của Admin này vào `frontend/src/pages/Admin/`:
- `AdminServices.js` và `AdminServices.css`
- `AdminAppointments.js`
- Đảm bảo `ProductManagement.js` & `ProductManagement.css` đã có mặt thay thế hoàn toàn cho `AdminProduct.js`!

**3. Khai Báo Router & Sidebar (Frontend)**
- Mở `frontend/src/App.js` import 3 giao diện mới `AdminAnalytics`, `ProductManagement`, `AdminServices`, `AdminAppointments`, vứt bỏ `AdminProduct.js`. Khai báo Route `<RoleRoute allowedRoles={[1]}>` cho quyền Admin.
- Mở `frontend/src/layouts/AdminLayout.js`, chèn menu liên kết vào List `menuItems` gồm: **Thống kê**, **Lịch hẹn**, **Dịch vụ**.

🔥 **Ghi chú riêng:** Gõ `npm install` và chạy File Script Backend SQL Server `SQL_Script_V2.sql` trước khi chạy server để không dính lỗi thiếu bảng Database! Mọi code này đã được tích hợp ổn định và loại bỏ toàn bộ conflict!
