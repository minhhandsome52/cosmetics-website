# 1.2 Tuần 2 (19/01 - 25/01)

## 1.2.1 Thực hành thiết kế cơ sở dữ liệu (MySQL)

### 1.2.1.1 Kiến thức doanh nghiệp training hoặc yêu cầu tự học

Trong tuần này, doanh nghiệp yêu cầu em thiết kế cơ sở dữ liệu quan hệ MySQL cho hệ thống quản lý mỹ phẩm. Các kiến thức trọng tâm bao gồm:

**Tên đề tài**: Quản lý mỹ phẩm theo lô sản phẩm và hạn sử dụng

**Các bảng chính cần thiết kế**:
- Bảng người dùng (users)
- Bảng danh mục (categories)
- Bảng sản phẩm (products)
- Bảng lô hàng (batches)
- Bảng tồn kho (inventory)
- Bảng đơn hàng (orders, order_items)

**Yêu cầu**: Các bảng phải liên kết với nhau thông qua khóa ngoại (Foreign Key), hỗ trợ truy vấn phức tạp như: lấy tồn kho theo lô, tính tổng doanh thu, lọc sản phẩm sắp hết hạn...

**Các kiến thức được đào tạo**:
- **Cấu trúc dữ liệu bảng (Table Schema)**: Cách định nghĩa các cột với kiểu dữ liệu phù hợp (VARCHAR, INT, DECIMAL, DATE, ENUM, TEXT)
- **Các kiểu dữ liệu trong MySQL**: Hiểu rõ sự khác biệt giữa VARCHAR vs TEXT, INT vs DECIMAL, DATE vs TIMESTAMP
- **Liên kết dữ liệu (Relationships)**: Thiết kế khóa chính (PRIMARY KEY), khóa ngoại (FOREIGN KEY) và các ràng buộc như ON DELETE CASCADE, ON DELETE RESTRICT
- **Đánh Index**: Tạo INDEX cho các trường thường xuyên được tìm kiếm để tối ưu hiệu năng truy vấn

### 1.2.1.2 Hiểu biết về nội dung kiến thức

Việc thiết kế cơ sở dữ liệu MySQL là bước nền tảng quan trọng trong quy trình phát triển phần mềm. Khác với việc lưu trữ bằng file JSON, MySQL cung cấp tính năng ACID (Atomicity, Consistency, Isolation, Durability) đảm bảo tính toàn vẹn dữ liệu.

Qua quá trình thực hiện, em nhận thấy việc thiết lập cấu trúc bảng dữ liệu chuẩn giúp lập trình viên có cái nhìn tổng quát về các thực thể (Entity) mà hệ thống sẽ quản lý. Ví dụ, khi thiết kế bảng `batches` cho quản lý lô hàng mỹ phẩm, việc phân chia rõ ràng các cột như `batch_number`, `manufacture_date`, `expiry_date`, `status` giúp việc viết các câu truy vấn SQL trở nên mạch lạc hơn.

Hơn nữa, việc áp dụng **Normalization (Chuẩn hóa dữ liệu)** giúp hạn chế tối đa tình trạng dư thừa và sai lệch thông tin. Em đã học được cách sử dụng các câu lệnh JOIN để liên kết giữa các bảng, từ đó hiểu rõ hơn về mối quan hệ **1-nhiều** (một sản phẩm có nhiều lô hàng) và **nhiều-nhiều** (một đơn hàng có nhiều sản phẩm từ nhiều lô) trong cơ sở dữ liệu thực tế.

---

## 1.2.2 Thiết kế kiến trúc tổng thể website

Trong tuần thứ hai, em tiến hành thiết kế kiến trúc tổng thể cho website quản lý mỹ phẩm. Website được xây dựng theo mô hình **Client-Server**, bao gồm:

| Thành phần | Công nghệ | Chức năng |
|------------|-----------|-----------|
| **Frontend** | HTML, CSS, JavaScript | Hiển thị giao diện và tương tác người dùng |
| **Backend** | Node.js (Express.js) | Xử lý logic nghiệp vụ, cung cấp RESTful API |
| **Database** | MySQL | Lưu trữ và quản lý dữ liệu |

**Luồng hoạt động của hệ thống**:
1. Người dùng tương tác với Frontend (trình duyệt)
2. Frontend gửi request HTTP đến Backend thông qua Fetch API
3. Backend xử lý logic, truy vấn MySQL
4. Backend trả về response JSON cho Frontend
5. Frontend hiển thị dữ liệu lên giao diện

Kiến trúc này phù hợp với mục tiêu thực tập, giúp em tập trung vào logic nghiệp vụ và luồng xử lý dữ liệu giữa các thành phần.

### 1.2.2.1 Thiết kế giao diện người dùng (Mockup)

Tiến hành thiết kế giao diện cho các trang chính của hệ thống:

**Giao diện phía khách hàng**:
- Trang chủ (index.html): Hiển thị sản phẩm nổi bật, danh mục
- Trang đăng nhập/đăng ký (login.html, register.html)
- Trang danh sách sản phẩm (products.html): Lọc theo danh mục, thương hiệu
- Trang chi tiết sản phẩm (product-detail.html): Thông tin, thành phần, đánh giá
- Trang giỏ hàng (cart.html)
- Trang thanh toán (checkout.html)
- Trang lịch sử đơn hàng (orders.html)

**Giao diện phía quản trị viên (admin/)**:
- Dashboard (dashboard.html): Thống kê, cảnh báo hàng sắp hết hạn
- Quản lý sản phẩm (products.html)
- Quản lý danh mục (categories.html)
- Quản lý lô hàng (batches.html)
- Quản lý đơn hàng (orders.html)
- Quản lý khách hàng (customers.html)
- Quản lý mã giảm giá (coupons.html)

**Giao diện được thiết kế theo tiêu chí**:
- Đơn giản, dễ sử dụng
- Responsive – tương thích đa thiết bị
- Màu sắc phù hợp với lĩnh vực mỹ phẩm (tone hồng, pastel)
- Dễ mở rộng và bảo trì

Mockup giúp em hình dung rõ cách bố trí thông tin và luồng tương tác của người dùng.

### 1.2.2.2 Thiết kế cơ sở dữ liệu phục vụ quản lý mỹ phẩm

Dựa trên yêu cầu hệ thống, em thiết kế cấu trúc cơ sở dữ liệu MySQL gồm 10 bảng chính:

**1. Bảng users (Người dùng)**:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR) – Họ tên
- email (VARCHAR, UNIQUE) – Email đăng nhập
- password (VARCHAR) – Mật khẩu đã mã hóa
- phone (VARCHAR) – Số điện thoại
- address (TEXT) – Địa chỉ
- role (ENUM: 'customer', 'admin') – Phân quyền
- created_at (TIMESTAMP) – Ngày đăng ký

**2. Bảng categories (Danh mục)**:
- id (INT, PRIMARY KEY)
- name (VARCHAR) – Tên danh mục
- description (TEXT) – Mô tả
- image_url (VARCHAR) – Hình ảnh

**3. Bảng products (Sản phẩm)**:
- id (INT, PRIMARY KEY)
- category_id (INT, FOREIGN KEY) – Liên kết danh mục
- name (VARCHAR) – Tên sản phẩm
- brand (VARCHAR) – Thương hiệu
- description (TEXT) – Mô tả
- ingredients (TEXT) – Thành phần
- usage_instructions (TEXT) – Hướng dẫn sử dụng
- price (DECIMAL) – Giá bán
- image_url (VARCHAR) – Hình ảnh
- is_active (BOOLEAN) – Trạng thái hoạt động

**4. Bảng batches (Lô hàng)** – *Điểm đặc thù của hệ thống*:
- id (INT, PRIMARY KEY)
- product_id (INT, FOREIGN KEY) – Liên kết sản phẩm
- batch_number (VARCHAR) – Số lô
- manufacture_date (DATE) – Ngày sản xuất
- expiry_date (DATE) – Hạn sử dụng
- initial_quantity (INT) – Số lượng nhập ban đầu
- status (ENUM: 'active', 'expired', 'sold_out') – Trạng thái lô

**5. Bảng inventory (Tồn kho)**:
- id (INT, PRIMARY KEY)
- batch_id (INT, FOREIGN KEY) – Liên kết lô hàng
- quantity (INT) – Số lượng tồn kho hiện tại

**6. Bảng orders (Đơn hàng)**:
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY) – Khách hàng
- total_amount (DECIMAL) – Tổng tiền
- shipping_address (TEXT) – Địa chỉ giao hàng
- status (ENUM: 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled')
- coupon_id (INT, FOREIGN KEY) – Mã giảm giá (nếu có)

**7. Bảng order_items (Chi tiết đơn hàng)**:
- id (INT, PRIMARY KEY)
- order_id (INT, FOREIGN KEY) – Liên kết đơn hàng
- product_id (INT, FOREIGN KEY) – Sản phẩm
- batch_id (INT, FOREIGN KEY) – Lô hàng được xuất (theo FEFO)
- quantity (INT) – Số lượng
- unit_price (DECIMAL) – Đơn giá

**8. Bảng cart_items (Giỏ hàng)**:
- id, user_id, product_id, quantity

**9. Bảng coupons (Mã giảm giá)**:
- id, code, discount_type, discount_value, min_order_amount, start_date, end_date

**10. Bảng wishlist (Yêu thích)**:
- id, user_id, product_id

**Sơ đồ quan hệ chính**:
```
categories (1) ──────< (n) products
products (1) ──────< (n) batches
batches (1) ──────── (1) inventory
users (1) ──────< (n) orders
orders (1) ──────< (n) order_items
order_items >────── (1) products
order_items >────── (1) batches
```

Cách tổ chức dữ liệu với các Foreign Key và Index giúp hệ thống đảm bảo tính toàn vẹn dữ liệu, dễ dàng truy xuất và hiển thị thông tin khi cần, đồng thời hỗ trợ các nghiệp vụ đặc thù như xuất hàng theo FEFO và cảnh báo hàng sắp hết hạn.

---

## 1.2.3 Thiết kế API Backend

Trong tuần này, em cũng tiến hành thiết kế danh sách các API RESTful phục vụ cho hệ thống:

| Nhóm API | Endpoint | Phương thức | Mô tả |
|----------|----------|-------------|-------|
| Auth | /api/auth/register | POST | Đăng ký tài khoản |
| Auth | /api/auth/login | POST | Đăng nhập |
| Products | /api/products | GET | Lấy danh sách sản phẩm |
| Products | /api/products/:id | GET | Lấy chi tiết sản phẩm |
| Categories | /api/categories | GET | Lấy danh sách danh mục |
| Batches | /api/batches | GET | Lấy danh sách lô hàng |
| Batches | /api/batches/expiring | GET | Lấy lô sắp hết hạn |
| Cart | /api/cart | GET/POST/PUT/DELETE | Quản lý giỏ hàng |
| Orders | /api/orders | GET/POST | Quản lý đơn hàng |

Danh sách API được thiết kế theo chuẩn RESTful, sử dụng các phương thức HTTP phù hợp và trả về dữ liệu dạng JSON.
