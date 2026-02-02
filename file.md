1.2 Tuần 2 (18/1 - 24/1):
1.2.1 Thực Hành Làm DataBase (Excel)
1.2.1.1 Kiến thức doanh nghiệp training hoặc yêu cầu tự học
Trong tuần này, doanh nghiệp yêu cầu tận dụng Excel như một công cụ quản lý dữ liệu ban đầu để mô phỏng cấu trúc database trước khi triển khai lên các hệ quản trị nội dung phức tạp. Các kiến thức trọng tâm bao gồm:
Tên đề tài: Quản lý sinh viên
Các bảng chính: Bảng điểm, bảng thông tin sinh viên, bảng môn học
Yêu cầu: Các bảng liên kết với nhau, có các hàm dùng để lọc thông tin như lấy thông tin sinh viên, tính điểm trung bình của sinh viên,....
Cấu trúc dữ liệu bảng (Table Schema): Cách thiết kế các cột (Fields) và dòng (Records) sao cho khoa học, tránh dư thừa dữ liệu.
Các kiểu dữ liệu cơ bản: Định dạng dữ liệu (String, Number, Date, Boolean) đồng nhất trong Excel để sau này dễ dàng Import/Export.
Liên kết dữ liệu (Relationships): Tư duy về khóa chính (Primary Key) và cách liên kết các bảng thông qua các hàm tham chiếu.
Xử lý và lọc dữ liệu (Data Cleaning): Sử dụng các công cụ lọc, sắp xếp và hàm kiểm tra để đảm bảo tính toàn vẹn của dữ liệu đầu vào.
1.2.1.2 Hiểu biết về nội dung kiến thức
Việc thực hành làm Database trên Excel là một bước đệm quan trọng trong quy trình phát triển phần mềm. Excel không chỉ đơn thuần là công cụ văn phòng, mà trong giai đoạn sơ khởi của dự án, nó đóng vai trò là một Flat-file Database (Cơ sở dữ liệu phẳng) vô cùng hiệu quả.
Qua quá trình thực hiện, em nhận thấy việc thiết lập một cấu trúc bảng dữ liệu chuẩn trên Excel giúp lập trình viên có cái nhìn tổng quát về thực thể (Entity) mà phần mềm sẽ quản lý. Ví dụ, khi thiết kế dữ liệu cho dự án quản lý, việc phân chia rõ ràng các cột như ID, Name, Status giúp việc viết các hàm để truy xuất dữ liệu sau này trở nên mạch lạc hơn.
Hơn nữa, việc rèn luyện tư duy Normaliation (Chuẩn hóa dữ liệu) ngay trên Excel giúp hạn chế tối đa việc sai lệch thông tin. Em đã học được cách sử dụng các hàm như VLOOKUP hoặc INDEX-MATCH để mô phỏng cơ chế liên kết giữa các bảng (Join), từ đó hiểu rõ hơn về mối quan hệ 1-nhiều hoặc nhiều-nhiều trong cơ sở dữ liệu thực tế. Đây là nền tảng cốt yếu để một lập trình viên có thể làm việc với các hệ thống lớn hơn như MySQL hay MongoDB sau này.
1.2.2 Thiết kế kiến trúc tổng thể website
Trong tuần thứ hai, em tiến hành thiết kế kiến trúc tổng thể cho website quản lý gói cước 3G. Website được xây dựng theo mô hình client–server đơn giản, bao gồm:
Frontend: HTML, CSS, JavaScript – chịu trách nhiệm hiển thị giao diện và tương tác người dùng
Backend: Node.js (Express) – xử lý logic đăng nhập, đăng ký, quản lý dữ liệu
Lưu trữ dữ liệu: sử dụng file JSON để mô phỏng cơ sở dữ liệu
Kiến trúc này phù hợp với mục tiêu thực tập, giúp em tập trung vào logic nghiệp vụ và luồng xử lý dữ liệu.
1.2.2.1 Thiết kế giao diện người dùng (Mockup)
Tiến hành thiết kế giao diện cho các trang chính của hệ thống, bao gồm:
Trang đăng nhập/đăng ký khách hàng
Trang hiển thị danh sách gói cước 3G
Trang lịch sử mua gói của khách hàng
Trang quản trị dành cho admin
Giao diện được thiết kế theo tiêu chí:
Đơn giản, dễ sử dụng
Phù hợp với người dùng phổ thông
Dễ mở rộng và chỉnh sửa sau này
Mockup giúp em hình dung rõ cách bố trí thông tin và luồng tương tác của người dùng.
1.2.2.2 Thiết kế cơ sở dữ liệu phục vụ quản lý gói cước
Dựa trên yêu cầu hệ thống, em thiết kế cấu trúc dữ liệu dưới dạng JSON, bao gồm:
customers.json:
Số điện thoại
Mật khẩu
Ngày đăng ký
Lịch sử mua gói
goicuoc.json:
Mã gói
Tên gói
Giá cước
Dung lượng data
Thời hạn sử dụng
admins.json:
Tài khoản quản trị viên
Cách tổ chức dữ liệu giúp hệ thống dễ dàng truy xuất và hiển thị thông tin khi cần.
