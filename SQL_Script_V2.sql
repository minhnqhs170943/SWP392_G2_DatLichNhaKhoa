-- =============================================
-- DATABASE: SWP392_Test
-- DESCRIPTION: Hệ thống quản lý phòng khám nha khoa (Khám bệnh & E-commerce)
-- =============================================

USE master;
GO
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'SWP392_TestVer2')
    DROP DATABASE SWP392_TestVer2;
GO
CREATE DATABASE SWP392_TestVer2;
GO
USE SWP392_TestVer2;
GO

-- 1. Bảng Phân quyền
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL -- Admin, Staff, Doctor, Patient
);

-- 2. Bảng Người dùng
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Address NVARCHAR(255),
    AvatarURL VARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Bảng Bác sĩ
CREATE TABLE Doctors (
    DoctorID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT UNIQUE FOREIGN KEY REFERENCES Users(UserID),
    Specialty NVARCHAR(100),
    ExperienceYears INT,
    Bio NVARCHAR(MAX),
    IsActive BIT DEFAULT 1
);

-- 4. Bảng Dịch vụ
CREATE TABLE Services (
    ServiceID INT PRIMARY KEY IDENTITY(1,1),
    ServiceName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(18, 2) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- 5. Bảng Lịch khám
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT FOREIGN KEY REFERENCES Users(UserID),
    DoctorID INT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    StaffID INT NULL FOREIGN KEY REFERENCES Users(UserID),
    AppointmentDate DATE NOT NULL,
    AppointmentTime TIME NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending', 
    Note NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- 6. Chi tiết dịch vụ trong lịch khám
CREATE TABLE AppointmentServices (
    AppointmentID INT FOREIGN KEY REFERENCES Appointments(AppointmentID),
    ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
    PriceAtBooking DECIMAL(18, 2) NOT NULL,
    PRIMARY KEY (AppointmentID, ServiceID)
);

-- 7. Bảng Sản phẩm
CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    ProductName NVARCHAR(255) NOT NULL,
    Brand NVARCHAR(100),
    Description NVARCHAR(MAX),
    Price DECIMAL(18, 2) NOT NULL,
    ImageURL VARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 8. Quản lý Giỏ hàng
CREATE TABLE Cart (
    CartID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT UNIQUE FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE CartItems (
    CartItemID INT PRIMARY KEY IDENTITY(1,1),
    CartID INT FOREIGN KEY REFERENCES Cart(CartID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL
);

-- 9. Bảng Đơn hàng (CÓ LIÊN KẾT VỚI APPOINTMENT)
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    -- ĐÂY LÀ DÒNG LIÊN KẾT: Cho phép NULL (0) hoặc có ID (N)
    AppointmentID INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID), 
    TotalAmount DECIMAL(18, 2) NOT NULL,
    ShippingAddress NVARCHAR(255),
    Status NVARCHAR(50) DEFAULT 'Pending',
    OrderDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE OrderDetails (
    OrderDetailID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18, 2) NOT NULL
);

-- 10. Bảng Hóa đơn (Hỗ trợ 1 Lịch khám/Đơn hàng có thể có nhiều Hóa đơn)
CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    AppointmentID INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    OrderID INT NULL FOREIGN KEY REFERENCES Orders(OrderID),
    TotalAmount DECIMAL(18, 2) NOT NULL,
    IssuedDate DATETIME DEFAULT GETDATE(),
    PaymentLinkId VARCHAR(100) NULL,
    Status NVARCHAR(50) DEFAULT 'Unpaid' 
);

-- 11. Bảng Thanh toán
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    InvoiceID INT FOREIGN KEY REFERENCES Invoices(InvoiceID),
    TransactionID VARCHAR(100),
    Amount DECIMAL(18, 2) NOT NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'PayOS_QR',
    PaymentDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50) 
);

-- 12. Thông báo
CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(255),
    Message NVARCHAR(MAX),
    ReferenceID INT NULL, 
    Type NVARCHAR(50),     
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 13. Đánh giá
CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- SEED DATA
-- =============================================

-- Roles
INSERT INTO Roles (RoleName) VALUES ('Admin');   -- RoleID = 1
INSERT INTO Roles (RoleName) VALUES ('Staff');   -- RoleID = 2
INSERT INTO Roles (RoleName) VALUES ('Patient'); -- RoleID = 3
INSERT INTO Roles (RoleName) VALUES ('Doctor');  -- RoleID = 4
GO
