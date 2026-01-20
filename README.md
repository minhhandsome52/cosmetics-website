# GlowUp - Hệ Thống Quản Lý Mỹ Phẩm

Hệ thống thương mại điện tử quản lý mỹ phẩm với các tính năng đặc thù về quản lý lô hàng và hạn sử dụng.

## 🚀 Cài Đặt & Chạy

### 1. Database (MySQL)

```sql
-- Tạo database
CREATE DATABASE cosmetics_db;
USE cosmetics_db;

-- Import schema và dữ liệu mẫu
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### 2. Backend

```bash
cd backend

# Cấu hình .env
# Sửa DB_PASSWORD theo MySQL của bạn

# Cài đặt dependencies (đã cài)
npm install

# Chạy server
npm run dev
```

Server chạy tại: http://localhost:3000

### 3. Frontend

Mở file `frontend/index.html` bằng Live Server (VS Code Extension)

## 📋 Tài Khoản Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mypham.com | 123456 |
| Customer | nguyenvana@gmail.com | 123456 |

## 🎯 Tính Năng Chính

### Khách hàng
- Xem sản phẩm theo danh mục, tìm kiếm
- Xem chi tiết (thành phần, công dụng, HSD)
- Thêm giỏ hàng, đặt hàng
- Xem lịch sử đơn hàng

### Quản trị viên
- Dashboard với cảnh báo lô sắp/đã hết hạn
- Quản lý sản phẩm (CRUD)
- Quản lý lô hàng và tồn kho
- Quản lý đơn hàng

### Nghiệp vụ đặc thù
- **FEFO**: Xuất kho theo lô có HSD gần nhất
- **Kiểm tra HSD**: Không cho phép bán sản phẩm hết hạn
- **Cảnh báo**: Hiển thị lô sắp hết hạn (≤30 ngày)

## 📁 Cấu Trúc

```
web mypham/
├── backend/          # Node.js + Express API
├── frontend/         # HTML + CSS + JS
│   ├── admin/        # Giao diện quản trị
│   ├── css/          # Styles
│   └── js/           # API module
└── database/         # SQL scripts
```

## 🔗 API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/categories` - Danh mục
- `GET /api/batches/expiring` - Lô sắp hết hạn
- `POST /api/orders` - Đặt hàng (kiểm tra HSD)
