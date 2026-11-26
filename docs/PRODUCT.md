# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Quản trị viên hệ thống:** Quản lý tài khoản nhân viên, định nghĩa vai trò và cấu hình bộ quyền nghiệp vụ theo từng phân hệ.
- **Nhân viên Chăm sóc khách hàng (CSKH) & Hỗ trợ:** Tra cứu khách hàng, liên kết mã khách hàng với số điện thoại xác thực từ hệ thống cấp nước, và cập nhật thông tin liên hệ/đồng hồ.

## Product Purpose

Cổng quản trị nội bộ cho hệ thống Chăm sóc khách hàng Cấp nước (`cskh-cap-nuoc-frontend-admin`), giúp nhân viên và quản trị viên vận hành tập trung dữ liệu liên kết khách hàng, quản lý tài khoản nhân sự và phân quyền động theo vai trò.

## Operating Context

- Người dùng làm việc chủ yếu trên màn hình desktop (`1366×768` trở lên) tại quầy giao dịch hoặc văn phòng, cần hỗ trợ responsive trên tablet/mobile khi cần.
- Luồng phân quyền hoạt động hoàn toàn động theo danh sách `permissionCodes` từ API `GET /admin/me` (`useAuthStore`), kết hợp `isSystemAdmin()` cho các thao tác đặc quyền `ADMIN`.
- Tài khoản nhân viên bị khóa (`active: false`) bị thu hồi toàn bộ phiên trong DB và không thể đăng nhập.

## Capabilities and Constraints

- **Quản lý liên kết khách hàng (`/customers`):** Tìm kiếm, xem chi tiết, tạo liên kết mới qua bước đối chiếu `(customerCode, phoneNumber)` với danh bạ V2 mô phỏng, cập nhật thông tin và hủy liên kết.
- **Quản lý tài khoản nhân viên (`/users`):** Lọc theo trạng thái/vai trò, tìm kiếm, thêm mới, chỉnh sửa thông tin, đổi vai trò, tạm khóa/kích hoạt lại và xóa tài khoản (kết nối API `/admin/*` qua `useRbacStore`).
- **Quản lý vai trò (`/roles`):** Tạo mới, nhân bản, chỉnh sửa thông tin và tích chọn quyền theo từng phân hệ trên một biểu mẫu thống nhất (`RoleFormView`), cảnh báo thay đổi chưa lưu và xóa vai trò tùy chỉnh (kết nối API `/admin/*` qua `useRbacStore`).
- **Danh mục quyền (`/permissions`):** Bảng tra cứu chỉ đọc các quyền kỹ thuật từ `GET /admin/get-permissions`.
- **Trạng thái dữ liệu hiện tại:** Xác thực (`/auth/staff/*`), danh mục quyền, vai trò và nhân viên đã kết nối trực tiếp Backend API; riêng màn hình `/customers` hiện vẫn dùng `MOCK_CUSTOMERS` chờ API `/admin/customers`.

## Brand Commitments

- Ngôn ngữ giao diện tiếng Việt chuẩn nghiệp vụ ngành cấp nước.
- Hỗ trợ chuyển đổi giao diện Sáng / Tối (`light` / `dark`) lưu trong `localStorage`.
- Mọi hành động lưu, xóa, khóa, nhân bản hoặc rời biểu mẫu chưa lưu đều yêu cầu xác nhận qua `ConfirmDialog` và hiển thị thông báo thành công toàn cục.

## Product Principles

1. **Cấp quyền nào, thấy mục và nút đó:** Sidebar, nút thao tác trên từng màn hình và quyền truy cập route đang mở đều đồng bộ tức thì theo `permissionCodes` của người dùng hiện tại.
2. **Dữ liệu dẫn dắt bố cục:** Không thêm biểu đồ hay thẻ thống kê giả lập; giữ không gian thoáng khi danh sách ít bản ghi.
3. **An toàn khi thao tác:** Luôn xác nhận trước khi thay đổi dữ liệu và bảo vệ người dùng khỏi mất dữ liệu chưa lưu.

## Accessibility & Inclusion

- Hỗ trợ điều hướng bàn phím đầy đủ, focus trap trong `ConfirmDialog` và `SlideOver`, đóng bằng phím `Escape` và khôi phục focus khi đóng.
- Tuân thủ `prefers-reduced-motion` trên toàn bộ hiệu ứng chuyển động.
