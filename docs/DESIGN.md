---
name: "CSKH Cấp Nước — Cổng Quản Trị"
description: "Hệ thống thiết kế giao diện vận hành nội bộ cho cổng quản trị chăm sóc khách hàng ngành cấp nước."
colors:
  primary: "#0369a1"
  primary-hover: "#0284c7"
  primary-foreground: "#ffffff"
  primary-tint: "#e0f2fe"
  primary-tint-ink: "#075985"
  background: "#f6f8fa"
  surface: "#ffffff"
  surface-subtle: "#eef2f6"
  surface-hover: "#f1f5f9"
  foreground: "#0f172a"
  foreground-muted: "#334155"
  foreground-subtle: "#475569"
  border: "#e2e8f0"
  border-strong: "#cbd5e1"
  success: "#0d9488"
  success-tint: "#ccfbf1"
  success-tint-ink: "#115e59"
  warning: "#d97706"
  warning-tint: "#fef3c7"
  warning-tint-ink: "#92400e"
  danger: "#dc2626"
  danger-tint: "#fee2e2"
  danger-tint-ink: "#991b1b"
  info: "#0284c7"
  info-tint: "#e0f2fe"
  info-tint-ink: "#075985"
  ring: "#0284c7"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  control: "8px"
  card: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  nav-item-active:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-tint-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  status-badge:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.foreground-muted}"
    rounded: "6px"
    padding: "2px 8px"
---

# Design System: CSKH Cấp Nước — Cổng Quản Trị

## Overview

**Creative North Star: "Bảng điều phối quầy giao dịch"**

Giao diện cổng quản trị được thiết kế theo tinh thần vận hành trực diện: sạch, điềm tĩnh, ưu tiên khả năng quét nhanh dữ liệu khách hàng, nhân viên và cấu hình phân quyền thay vì trang trí. Mọi màn hình sử dụng nền sáng trung tính dịu mắt (`#f6f8fa`) làm lớp nền tổng thể để các bảng dữ liệu và biểu mẫu trắng (`#ffffff`) nổi bật nhờ đường viền mảnh (`1px`) thay vì đổ bóng nặng.

Hệ thống hỗ trợ cả chế độ sáng và tối (`data-theme="dark"`) với độ tương phản rõ ràng cho các thông số nghiệp vụ như mã khách hàng, số đồng hồ, số điện thoại và dư nợ. Nhịp chuyển động tiết chế, chỉ xuất hiện khi mở ngăn kéo, menu ngữ cảnh hoặc hộp thoại xác nhận, giúp nhân viên tổng đài và quản trị viên thao tác liên tục mà không bị xao nhãng.

**Key Characteristics:**
- Bố cục thanh bên cố định (`256px` trên desktop) kết hợp vùng nội dung tối đa `1440px`.
- Thanh tìm kiếm và bộ lọc đặt trực tiếp trên nền trang, không đóng khung card thừa.
- Nhãn màu chỉ dành cho trạng thái nghiệp vụ và nhãn mặc định; tên vai trò hiển thị dạng chữ thường dễ đọc.
- Mọi thao tác tạo, sửa, xóa, khóa hoặc rời biểu mẫu chưa lưu đều có hộp thoại xác nhận (`ConfirmDialog`) và thông báo thành công toàn cục.

## Colors

Bảng màu lấy sắc xanh nước biển sâu làm điểm nhấn thương hiệu duy nhất trên nền xám đá lạnh trung tính, kết hợp 4 cặp màu ngữ nghĩa dùng riêng cho trạng thái.

### Primary
- **Cerulean Utility** (`#0369a1`): Dùng cho nút hành động chính, liên kết nhấn mạnh, dấu kiểm phân quyền và con trỏ nhập liệu.
- **Cerulean Hover** (`#0284c7`): Trạng thái di chuột trên nút chính, vòng focus (`--ring`) và nhãn thông tin.
- **Water Mist Tint** (`#e0f2fe` / chữ `#075985`): Nền mục menu đang chọn trong sidebar và avatar ký tự viết tắt người dùng.

### Neutral
- **Cool Slate Canvas** (`#f6f8fa`): Nền chính của trang quản trị.
- **Pure Paper Surface** (`#ffffff`): Nền bảng dữ liệu, thẻ biểu mẫu, ngăn kéo (`SlideOver`) và hộp thoại xác nhận (`ConfirmDialog`).
- **Subtle Header Surface** (`#eef2f6`): Nền tiêu đề bảng, tiêu đề nhóm quyền và nhãn trung tính.
- **Ink Slate** (`#0f172a` / phụ `#334155` / mờ `#475569`): Phân cấp chữ chính, chữ mô tả và chữ phụ đảm bảo độ tương phản cao.
- **Hairline Border** (`#e2e8f0` / nhấn `#cbd5e1`): Đường phân tách chính thay cho bóng đổ.

### Semantic Status
- **Teal Success** (`#0d9488`, nền `#ccfbf1`, chữ `#115e59`): Trạng thái đang hoạt động và thông báo lưu thành công.
- **Amber Warning** (`#d97706`, nền `#fef3c7`, chữ `#92400e`): Cảnh báo thay đổi chưa lưu hoặc tác động dây chuyền khi xóa vai trò.
- **Crimson Danger** (`#dc2626`, nền `#fee2e2`, chữ `#991b1b`): Lỗi kiểm tra dữ liệu, nút xóa/hủy liên kết và khóa tài khoản.

**The Status-Only Color Rule.** Màu sắc rực chỉ xuất hiện ở trạng thái hoạt động/khóa, cảnh báo và nút hành động chính; tuyệt đối không tô màu sặc sỡ cho tên vai trò hay các cột dữ liệu thông thường.

## Typography

**Body & UI Font:** `Inter` (hỗ trợ đầy đủ tiếng Việt, fallback `ui-sans-serif, system-ui, sans-serif`)
**Mono Font:** `JetBrains Mono` (fallback `ui-monospace, SFMono-Regular, monospace`)

**Character:** Sạch, gọn, tối ưu cho đọc bảng số liệu tiếng Việt có dấu ở kích thước `14px`, kết hợp `JetBrains Mono` và `tabular-nums` để mã khách hàng, số đồng hồ và tiền tệ thẳng hàng theo cột.

### Hierarchy
- **Headline** (`600`, `18px`, `line-height: 1.4`): Tiêu đề trang trong header (`16px`) và tiêu đề biểu mẫu vai trò (`18px`).
- **Title** (`600`, `14px`, `line-height: 1.4`): Tiêu đề khối biểu mẫu, tiêu đề nhóm quyền và tên mục điều hướng.
- **Body** (`400`, `14px`, `line-height: 1.5`): Nội dung chính trong bảng dữ liệu, thanh tìm kiếm và ô nhập liệu.
- **Label** (`500`, `12px`, `line-height: 1.35`): Tiêu đề cột bảng, nhãn trường nhập liệu, nút phụ và badge trạng thái.
- **Mono** (`500`, `14px`, `whitespace-nowrap`): Mã khách hàng, số đồng hồ, mã quyền kỹ thuật (`customers.view`, `roles.update`).

**The Single-Line Code Rule.** Mã khách hàng và số đồng hồ luôn sử dụng font monospace kèm `whitespace-nowrap` để không bị ngắt dòng giữa dấu gạch nối (`-`).

## Layout

- **Shell:** Sidebar trái cố định `256px` trên màn hình `lg` (`≥1024px`), thu gọn thành drawer trượt trên màn hình nhỏ. Header cao `56px` (`sticky top-0 z-30`).
- **Main Container:** Vùng nội dung căn giữa với `max-width: 1440px`, đệm ngang `16px` trên mobile và `24px` trên tablet/desktop (`py-6`).
- **Vertical Rhythm:** Khoảng cách giữa thanh công cụ và bảng là `20px` (`space-y-5`); khoảng cách giữa các trường trong biểu mẫu là `16px` (`space-y-4`).
- **Empty & Sparse Space:** Khi bảng có ít dòng dữ liệu hoặc không tìm thấy kết quả, giữ nguyên khoảng trống tự nhiên hoặc hiển thị trạng thái rỗng tối giản với nút khôi phục bộ lọc; không thêm card thống kê hay biểu đồ trang trí.

## Elevation & Depth

Hệ thống theo triết lý **phẳng và phân lớp bằng viền (`Flat-by-Default`)**. Bảng dữ liệu, thanh bên và các khối biểu mẫu nằm phẳng trên nền nhờ viền `1px solid var(--border)`.

### Shadow Vocabulary
- **Sticky Action Bar / Alert** (`shadow-md`): Thanh lưu vai trò dính đáy (`backdrop-blur-sm`) và thông báo thành công góc phải trên.
- **Dialog & Drawer** (`shadow-lg` / `shadow-xl`): `ConfirmDialog` và `SlideOver` nổi trên lớp phủ tối `rgba(2, 6, 23, 0.45)` được render qua React Portal vào `document.body` để không bị kẹt dưới header cố định.

**The Portal Overlay Rule.** Mọi lớp phủ toàn màn hình (`ConfirmDialog`, `SlideOver`) phải render qua `createPortal(..., document.body)` để tránh bị CSS stacking context của hiệu ứng `animate-fade-in` hoặc `sticky header` đè lên.

## Shapes

- **Control Radius (`8px`):** Thống nhất cho tất cả nút bấm, ô nhập liệu, ô chọn (`select`), mục menu sidebar và hộp checkbox.
- **Container Radius (`12px`):** Thống nhất cho bảng dữ liệu, card biểu mẫu vai trò, hộp thoại xác nhận và thẻ đăng nhập.
- **Badge Radius (`6px`):** Dùng cho `StatusBadge` để tách biệt nhẹ khỏi nút bấm `8px`.

## Components

### Buttons
- **Primary:** Nền `#0369a1`, chữ trắng `#ffffff`, cao `36px`, bo `8px`, đệm ngang `14px`, hover sang `#0284c7`.
- **Secondary:** Nền `#ffffff`, viền `1px` `#e2e8f0`, chữ `#0f172a`, cao `36px`, bo `8px`, hover sang `#f1f5f9`.
- **Danger:** Nền `#dc2626`, chữ trắng trong hộp thoại xác nhận hành động phá hủy (xóa vai trò, hủy liên kết, khóa tài khoản).

### Inputs & Selects
- **Style:** Cao `36px`, nền `#ffffff` (hoặc `#f6f8fa` bên trong card/drawer), viền `1px` `#e2e8f0`, bo `8px`, chữ `14px`.
- **Focus:** Đổi viền sang `#0369a1` và hiển thị vòng focus `2px solid #0284c7` (`outline-offset: 2px`) qua `:focus-visible`.
- **Error:** Viền `#dc2626` kèm thông báo lỗi ngay bên dưới trường nhập (`12px`).

### Tables & Action Menus
- **Header:** Nền `#eef2f6`, chữ `12px` `font-medium`, màu `#334155`.
- **Rows:** Chữ `14px`, chia dòng bằng đường kẻ mảnh `1px`, hover nền `#f1f5f9`.
- **ActionMenu:** Nút `⋯` mở menu thả nổi (`w-48`, `z-50`, animation `dropdown-in 150ms`), tự động ẩn các mục không đủ quyền theo `hasPermission`.

### Navigation
- **Sidebar:** Phân nhóm theo `Quản lý người dùng` và `Phân quyền`; tự động lọc từng mục theo `requiredPermission` và ẩn hoàn toàn nhóm không còn mục nào.
- **Route Guard:** Khi người dùng chuyển sang tài khoản thiếu quyền hoặc bị khóa, vùng nội dung hiển thị màn hình khóa quyền thay vì render nội dung cũ.

## Do's and Don'ts

### Do:
- **Do** giữ kích thước chữ dữ liệu chính ở mức `14px` và sử dụng `tabular-nums` cho cột số/ngày giờ.
- **Do** render `ConfirmDialog` và `SlideOver` qua `createPortal(..., document.body)` để lớp phủ tối phủ kín toàn bộ viewport.
- **Do** ẩn nút tạo/sửa/xóa và chặn nội dung trang dựa trên `hasPermission(...)` thay vì kiểm tra cứng tên vai trò.
- **Do** tôn trọng `prefers-reduced-motion` bằng cách triệt tiêu thời lượng animation khi người dùng bật giảm chuyển động.

### Don't:
- **Don't** đặt thanh tìm kiếm hoặc bộ lọc bên trong một card trắng riêng phía trên bảng dữ liệu.
- **Don't** gắn nhãn màu cho tên vai trò trong bảng nhân viên hoặc thêm biểu đồ/thẻ thống kê trang trí khi màn hình chưa có dữ liệu tổng hợp thực.
- **Don't** cho phép mã đồng hồ hoặc nút bấm hành động xuống dòng giữa chừng (`whitespace-nowrap`).
- **Don't** viết cứng phân quyền theo tên vai trò (`ADMIN`, `CSKH`, `SUPPORT`) trong giao diện điều hướng hoặc kiểm tra nút.
