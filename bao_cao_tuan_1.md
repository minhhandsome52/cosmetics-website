# 1.1.4 Tuần 1 (12/01 – 18/01)

## 1.1.4.1 Tìm hiểu tổng quan lĩnh vực kinh doanh mỹ phẩm và quản lý hạn sử dụng

Trong tuần đầu tiên của đợt thực tập, em được tiếp cận tổng quan về lĩnh vực kinh doanh mỹ phẩm trực tuyến, trong đó trọng tâm là nghiệp vụ quản lý sản phẩm theo lô hàng và hạn sử dụng. Nội dung tìm hiểu bao gồm:

- **Đặc thù của mỹ phẩm**: Mỹ phẩm là sản phẩm có thời hạn sử dụng hữu hạn, cần được quản lý chặt chẽ để đảm bảo chất lượng và an toàn cho người tiêu dùng.
- **Cấu trúc thông tin sản phẩm mỹ phẩm**: tên sản phẩm, thương hiệu, thành phần (ingredients), hướng dẫn sử dụng, giá bán, hình ảnh.
- **Nghiệp vụ quản lý lô hàng**: Mỗi lô hàng mỹ phẩm được định danh bằng số lô (batch number), có ngày sản xuất và hạn sử dụng riêng biệt.
- **Phân loại trạng thái lô hàng**:
  - `active`: Lô hàng còn hạn, đang bán
  - `expired`: Lô hàng đã hết hạn, không được bán
  - `sold_out`: Lô hàng đã bán hết

Thông qua việc tìm hiểu này, em nắm được bài toán nghiệp vụ cốt lõi mà website cần giải quyết, đó là **quản lý thông tin sản phẩm mỹ phẩm theo từng lô hàng và kiểm soát hạn sử dụng** để đảm bảo không bán sản phẩm hết hạn cho khách hàng.

---

## 1.1.4.2 Khảo sát nghiệp vụ quản lý mỹ phẩm tại doanh nghiệp

Sau khi nắm được tổng quan, em tiến hành khảo sát nghiệp vụ thực tế tại doanh nghiệp, tập trung vào các quy trình xử lý dữ liệu trong hệ thống, bao gồm:

**Nghiệp vụ phía khách hàng:**
- Khách hàng đăng ký tài khoản bằng email và mật khẩu
- Khách hàng đăng nhập để xem danh sách sản phẩm mỹ phẩm theo danh mục
- Tìm kiếm sản phẩm theo tên, thương hiệu
- Xem thông tin chi tiết sản phẩm (thành phần, công dụng, hạn sử dụng)
- Thêm sản phẩm vào giỏ hàng và tiến hành đặt hàng
- Xem lịch sử đơn hàng đã mua

**Nghiệp vụ phía quản trị viên:**
- Quản lý danh mục sản phẩm (thêm, sửa, xóa)
- Quản lý sản phẩm mỹ phẩm (thêm, sửa, xóa, kích hoạt/vô hiệu hóa)
- Quản lý lô hàng: nhập lô mới với số lô, ngày sản xuất, hạn sử dụng, số lượng
- Quản lý tồn kho theo từng lô hàng
- Theo dõi cảnh báo lô hàng sắp hết hạn (trong 30 ngày) và đã hết hạn
- Quản lý đơn hàng và cập nhật trạng thái đơn hàng

**Nghiệp vụ đặc thù - Nguyên tắc FEFO (First Expired, First Out):**
Khi khách hàng đặt hàng, hệ thống tự động ưu tiên xuất các lô hàng có **hạn sử dụng gần nhất** trước. Điều này đảm bảo:
- Giảm thiểu rủi ro hàng tồn kho hết hạn
- Khách hàng luôn nhận được sản phẩm còn hạn sử dụng lâu nhất có thể

Quá trình khảo sát giúp em hiểu rõ mối quan hệ giữa **Sản phẩm – Lô hàng – Tồn kho – Đơn hàng**, từ đó hình dung được các chức năng chính cần xây dựng trong website.

---

## 1.1.4.3 Thu thập và phân tích yêu cầu hệ thống website

Từ khảo sát nghiệp vụ, em tiến hành phân tích và tổng hợp yêu cầu hệ thống, bao gồm:

### Yêu cầu chức năng phía khách hàng:
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Đăng ký tài khoản | Tạo tài khoản bằng email, mật khẩu |
| 2 | Đăng nhập | Xác thực và nhận token JWT |
| 3 | Xem sản phẩm | Xem danh sách, lọc theo danh mục, thương hiệu |
| 4 | Tìm kiếm sản phẩm | Tìm theo tên sản phẩm |
| 5 | Xem chi tiết sản phẩm | Xem thành phần, công dụng, tồn kho |
| 6 | Giỏ hàng | Thêm, sửa, xóa sản phẩm trong giỏ |
| 7 | Đặt hàng | Tạo đơn hàng, áp dụng mã giảm giá |
| 8 | Lịch sử đơn hàng | Xem các đơn đã đặt |
| 9 | Đánh giá sản phẩm | Viết review và cho điểm sao |
| 10 | Wishlist | Lưu sản phẩm yêu thích |

### Yêu cầu chức năng phía quản trị viên:
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Dashboard | Thống kê tổng quan + cảnh báo hạn sử dụng |
| 2 | Quản lý danh mục | Thêm, sửa, xóa danh mục sản phẩm |
| 3 | Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm mỹ phẩm |
| 4 | Quản lý lô hàng | Thêm lô mới, cập nhật, xóa lô hàng |
| 5 | Quản lý tồn kho | Điều chỉnh số lượng tồn kho theo lô |
| 6 | Cảnh báo hết hạn | Xem lô sắp hết hạn (≤30 ngày) và đã hết hạn |
| 7 | Quản lý đơn hàng | Xem và cập nhật trạng thái đơn hàng |
| 8 | Quản lý khách hàng | Xem thông tin và lịch sử mua hàng |
| 9 | Quản lý mã giảm giá | Thêm, sửa, xóa coupon khuyến mãi |

### Yêu cầu phi chức năng:
- **Bảo mật**: Mã hóa mật khẩu (bcrypt), xác thực JWT Token
- **Hiệu năng**: Đánh index cho các trường tìm kiếm thường xuyên
- **Tính toàn vẹn dữ liệu**: Sử dụng Foreign Key để đảm bảo ràng buộc dữ liệu

Các yêu cầu này được ghi nhận thành tài liệu yêu cầu hệ thống, làm nền tảng cho các bước thiết kế và phát triển website ở các tuần tiếp theo.

---

## 1.1.4.4 Những tài liệu - phần mềm đã sử dụng

### MDN Web Docs (Mozilla Developer Network)
Đây là nguồn tài liệu chính thống và đáng tin cậy để tra cứu các kiến thức về:
- **HTML5**: Cấu trúc trang web, form đăng nhập/đăng ký, bảng danh sách sản phẩm
- **CSS3**: Bố cục giao diện, flexbox, responsive layout, styling cho trang sản phẩm và giỏ hàng
- **JavaScript**: Xử lý sự kiện (event), thao tác DOM, validate dữ liệu đầu vào, lưu trữ LocalStorage

### JavaScript.info
Tài liệu chuyên sâu giúp em hiểu rõ hơn về:
- Cách tổ chức mã JavaScript theo module
- Cơ chế bất đồng bộ (Async/Await) khi gọi API từ phía client
- Tư duy lập trình hướng sự kiện, áp dụng vào các chức năng như thêm giỏ hàng, hiển thị sản phẩm

### Node.js Documentation
Tài liệu chính thức về Node.js và Express.js:
- Cách xây dựng RESTful API
- Middleware và routing
- Kết nối cơ sở dữ liệu MySQL

### Visual Studio Code (VS Code)
Là công cụ lập trình chính, hỗ trợ:
- Viết và quản lý mã HTML, CSS, JavaScript, Node.js
- Cài đặt các extension như: Live Server, Prettier, ESLint giúp chuẩn hóa mã nguồn
- Quản lý cấu trúc thư mục dự án

### Google Chrome DevTools
Hỗ trợ:
- Debug JavaScript phía client
- Kiểm tra lỗi giao diện CSS
- Theo dõi request/response khi gọi API (Network tab)
- Kiểm tra dữ liệu LocalStorage và Session

### Postman
Công cụ kiểm thử API:
- Test các API endpoint (GET, POST, PUT, DELETE)
- Gửi request với headers và body
- Kiểm tra response trả về từ server

### MySQL Workbench
Công cụ quản lý cơ sở dữ liệu:
- Thiết kế và xem sơ đồ ERD
- Chạy các câu lệnh SQL
- Quản lý dữ liệu trong các bảng
