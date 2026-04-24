USE [master]
GO
CREATE DATABASE [SWP392_Final]
GO
USE [SWP392_Final]
GO

-- 1. Bảng Roles
CREATE TABLE [dbo].[Roles](
    [RoleID] [int] IDENTITY(1,1) PRIMARY KEY,
    [RoleName] [nvarchar](50) NOT NULL
)
GO

-- 2. Bảng Users
CREATE TABLE [dbo].[Users](
    [UserID] [int] IDENTITY(1,1) PRIMARY KEY,
    [RoleID] [int] REFERENCES [Roles]([RoleID]),
    [Email] [varchar](100) UNIQUE,
    [Password] [varchar](255) NOT NULL,
    [FullName] [nvarchar](100) NOT NULL,
    [Phone] [varchar](15),
    [Address] [nvarchar](255),
    [AvatarURL] [varchar](max),
    [IsActive] [bit] DEFAULT (1),
    [CreatedAt] [datetime] DEFAULT (getdate())
)
GO

-- 3. Bảng Doctors
CREATE TABLE [dbo].[Doctors](
    [DoctorID] [int] IDENTITY(1,1) PRIMARY KEY,
    [UserID] [int] UNIQUE REFERENCES [Users]([UserID]),
    [Specialty] [nvarchar](100),
    [ExperienceYears] [int],
    [Bio] [nvarchar](max),
    [IsActive] [bit] DEFAULT (1)
)
GO

-- 4. Bảng Services
CREATE TABLE [dbo].[Services](
    [ServiceID] [int] IDENTITY(1,1) PRIMARY KEY,
    [ServiceName] [nvarchar](100) NOT NULL,
    [Description] [nvarchar](max),
    [Price] [decimal](18, 2) NOT NULL,
    [IsActive] [bit] DEFAULT (1)
)
GO

-- 5. Bảng Appointments
CREATE TABLE [dbo].[Appointments](
    [AppointmentID] [int] IDENTITY(1,1) PRIMARY KEY,
    [PatientID] [int] REFERENCES [Users]([UserID]),
    [DoctorID] [int] REFERENCES [Doctors]([DoctorID]),
    [StaffID] [int] REFERENCES [Users]([UserID]),
    [AppointmentDate] [date] NOT NULL,
    [AppointmentTime] [time](7) NOT NULL,
    [Status] [nvarchar](50) DEFAULT ('Pending'),
    [Note] [nvarchar](max),
    [CreatedAt] [datetime] DEFAULT (getdate()),
    [UpdatedAt] [datetime] DEFAULT (getdate()),
    [FollowUpDate] [date],
    [FollowUpNote] [nvarchar](max),
    [MedicalRecord] [nvarchar](max)
)
GO

-- 6. Bảng AppointmentServices (Many-to-Many)
CREATE TABLE [dbo].[AppointmentServices](
    [AppointmentID] [int] REFERENCES [Appointments]([AppointmentID]),
    [ServiceID] [int] REFERENCES [Services]([ServiceID]),
    [PriceAtBooking] [decimal](18, 2),
    PRIMARY KEY ([AppointmentID], [ServiceID])
)
GO

-- 7. Bảng Products
CREATE TABLE [dbo].[Products](
    [ProductID] [int] IDENTITY(1,1) PRIMARY KEY,
    [ProductName] [nvarchar](255) NOT NULL,
    [Brand] [nvarchar](100),
    [Description] [nvarchar](max),
    [Price] [decimal](18, 2) NOT NULL,
    [ImageURL] [varchar](max),
    [IsActive] [bit] DEFAULT (1),
    [CreatedAt] [datetime] DEFAULT (getdate())
)
GO

-- 8. Bảng Orders & OrderDetails
CREATE TABLE [dbo].[Orders](
    [OrderID] [int] IDENTITY(1,1) PRIMARY KEY,
    [UserID] [int] REFERENCES [Users]([UserID]),
    [AppointmentID] [int] REFERENCES [Appointments]([AppointmentID]),
    [TotalAmount] [decimal](18, 2) NOT NULL,
    [ShippingAddress] [nvarchar](255),
    [Status] [nvarchar](50) DEFAULT ('Pending'),
    [OrderDate] [datetime] DEFAULT (getdate())
)

CREATE TABLE [dbo].[OrderDetails](
    [OrderDetailID] [int] IDENTITY(1,1) PRIMARY KEY,
    [OrderID] [int] REFERENCES [Orders]([OrderID]),
    [ProductID] [int] REFERENCES [Products]([ProductID]),
    [Quantity] [int] NOT NULL,
    [UnitPrice] [decimal](18, 2) NOT NULL
)
GO

-- 9. Bảng Invoices & Payments
CREATE TABLE [dbo].[Invoices](
    [InvoiceID] [int] IDENTITY(1,1) PRIMARY KEY,
    [AppointmentID] [int] REFERENCES [Appointments]([AppointmentID]),
    [OrderID] [int] REFERENCES [Orders]([OrderID]),
    [TotalAmount] [decimal](18, 2) NOT NULL,
    [IssuedDate] [datetime] DEFAULT (getdate()),
    [PaymentLinkId] [varchar](100),
    [Status] [nvarchar](50) DEFAULT ('Unpaid')
)

CREATE TABLE [dbo].[Payments](
    [PaymentID] [int] IDENTITY(1,1) PRIMARY KEY,
    [InvoiceID] [int] REFERENCES [Invoices]([InvoiceID]),
    [TransactionID] [varchar](100),
    [Amount] [decimal](18, 2) NOT NULL,
    [PaymentMethod] [nvarchar](50) DEFAULT ('PayOS_QR'),
    [PaymentDate] [datetime] DEFAULT (getdate()),
    [Status] [nvarchar](50)
)
GO

-- 10. Bảng Cart & CartItems
CREATE TABLE [dbo].[Cart](
    [CartID] [int] IDENTITY(1,1) PRIMARY KEY,
    [UserID] [int] UNIQUE REFERENCES [Users]([UserID]),
    [CreatedAt] [datetime] DEFAULT (getdate())
)

CREATE TABLE [dbo].[CartItems](
    [CartItemID] [int] IDENTITY(1,1) PRIMARY KEY,
    [CartID] [int] REFERENCES [Cart]([CartID]),
    [ProductID] [int] REFERENCES [Products]([ProductID]),
    [Quantity] [int] NOT NULL
)
GO

-- 11. Các bảng hỗ trợ (Blogs, Reviews, Notifications, Homepage)
CREATE TABLE [dbo].[Blogs](
    [BlogID] [int] IDENTITY(1,1) PRIMARY KEY,
    [Title] [nvarchar](500) NOT NULL,
    [Slug] [varchar](500) UNIQUE NOT NULL,
    [Summary] [nvarchar](max),
    [Content] [nvarchar](max) NOT NULL,
    [ThumbnailURL] [varchar](max),
    [AuthorName] [nvarchar](100),
    [Category] [nvarchar](100),
    [Tags] [nvarchar](255),
    [ViewCount] [int] DEFAULT (0),
    [IsPublished] [bit] DEFAULT (1),
    [PublishedDate] [datetime],
    [CreatedAt] [datetime] DEFAULT (getdate()),
    [UpdatedAt] [datetime] DEFAULT (getdate())
)

CREATE TABLE [dbo].[Reviews](
    [ReviewID] [int] IDENTITY(1,1) PRIMARY KEY,
    [AppointmentID] [int] UNIQUE REFERENCES [Appointments]([AppointmentID]),
    [UserID] [int] REFERENCES [Users]([UserID]),
    [Rating] [int] CHECK ([Rating] BETWEEN 1 AND 5) NOT NULL,
    [Comment] [nvarchar](max),
    [CreatedAt] [datetime] DEFAULT (getdate()),
    [EditCount] [int] DEFAULT (0),
    [UpdatedAt] [datetime] DEFAULT (getdate())
)

CREATE TABLE [dbo].[Notifications](
    [NotificationID] [int] IDENTITY(1,1) PRIMARY KEY,
    [UserID] [int] REFERENCES [Users]([UserID]),
    [Title] [nvarchar](255),
    [Message] [nvarchar](max),
    [ReferenceID] [int],
    [Type] [nvarchar](50),
    [IsRead] [bit] DEFAULT (0),
    [CreatedAt] [datetime] DEFAULT (getdate())
)

CREATE TABLE [dbo].[HomepageSections](
    [SectionID] [int] IDENTITY(1,1) PRIMARY KEY,
    [SectionType] [varchar](50) NOT NULL,
    [Title] [nvarchar](255) NOT NULL,
    [IsActive] [bit] DEFAULT (1),
    [DisplayOrder] [int] NOT NULL,
    [ItemLimit] [int] DEFAULT (4),
    [Criteria] [varchar](50) DEFAULT ('new'),
    [UpdatedAt] [datetime] DEFAULT (getdate())
)
GO

ALTER TABLE [dbo].[Appointments]
ADD [CancelReason] [nvarchar](max);