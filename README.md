# CSKH Cấp Nước — Cổng Quản Trị (Frontend Admin)

Giao diện quản trị nội bộ cho hệ thống Chăm sóc khách hàng ngành Cấp nước, xây dựng bằng Next.js App Router, React, TypeScript và Tailwind CSS v4.

## Công nghệ sử dụng

- **Framework:** Next.js `16.4.6` (App Router, Turbopack)
- **Ngôn ngữ:** React `19.3`, TypeScript `5`
- **Styling:** Tailwind CSS `4.3` với CSS Variables hỗ trợ Sáng / Tối (`data-theme="dark"`)
- **Icons:** `lucide-react`
- **State:** `zustand` (`auth.store.ts`, `rbac.store.ts`, `alert.store.ts`)
- **Typography:** `Inter` và `JetBrains Mono` qua `next/font/google`

## Cấu trúc thư mục chính

```text
app/
├── customers/page.tsx      # Quản lý liên kết khách hàng (hiện dùng MOCK_CUSTOMERS)
├── users/page.tsx          # Quản lý tài khoản nhân viên
├── roles/page.tsx          # Quản lý vai trò & gán quyền theo phân hệ
├── permissions/page.tsx    # Danh mục quyền hệ thống (chỉ đọc)
├── login/page.tsx          # Màn hình đăng nhập nhân viên
├── globals.css             # Token màu sắc, font, animation và prefers-reduced-motion
└── layout.tsx              # Root layout bọc AdminShell

components/
├── layout/
│   ├── AdminShell.tsx      # Sidebar phân quyền, route guard & đổi theme
│   └── AlertToastContainer.tsx # Toast thông báo toàn cục
├── roles/
│   ├── RolesPanel.tsx      # Bảng vai trò, tìm kiếm, nhân bản, xóa
│   ├── RoleFormView.tsx    # Biểu mẫu tạo/sửa vai trò & cảnh báo chưa lưu
│   └── PermissionSelector.tsx # Bộ chọn quyền nhóm theo phân hệ
├── users/
│   ├── UsersPanel.tsx      # Bảng nhân viên, lọc, phân trang, khóa/xóa
│   ├── StaffFormSlideOver.tsx # Drawer thêm/sửa nhân viên
│   └── AssignRoleSlideOver.tsx # Drawer đổi vai trò nhân viên
├── permissions/PermissionsPanel.tsx
└── ui/                     # ActionMenu, ConfirmDialog (Portal), SlideOver (Portal), StatusBadge

services/
├── api/                    # auth.api.ts, permissions.api.ts, roles.api.ts, staff.api.ts
└── mock-data.ts            # Dữ liệu mẫu cho màn hình /customers

stores/                     # auth.store.ts, rbac.store.ts, alert.store.ts
lib/
├── api-client.ts           # Fetch wrapper (/api/backend/*), mở bọc { EC, data }, xử lý 401/403
└── format.ts               # Định dạng tiền tệ VND và ngày giờ vi-VN
types/index.ts              # Định nghĩa kiểu dữ liệu AdminAccessProfile, StaffUser, RoleDefinition, PermissionItem
```

## Cơ chế xác thực & phân quyền (RBAC) hiện tại

- **Kết nối Backend:** Next.js rewrite `/api/backend/:path*` → `${BACKEND_URL}/:path*` (mặc định `http://localhost:8080`) để dùng cookie `HttpOnly` (`cskh-staff.session_token`) cùng origin.
- **Xác thực & RBAC thật:** `useAuthStore` gọi `GET /admin/me` lấy `AdminAccessProfile` (`permissionCodes[]`, `role`), `hasPermission(...)` lọc sidebar và nút bấm, `isSystemAdmin()` kiểm soát thao tác đặc quyền `ADMIN`.
- **Đồng bộ quyền tức thì:** Khi API trả `403`, `apiRequest` tự hiển thị thông báo và gọi `refreshMe()` để đồng bộ lại quyền từ Backend; khi trả `401`, tự xóa phiên và đưa về `/login`.
- **Dữ liệu mẫu còn lại:** Riêng màn hình `/customers` hiện vẫn dùng `MOCK_CUSTOMERS` trong `services/mock-data.ts` (chờ API `/admin/customers` ở Backend).

## Tài liệu sản phẩm & thiết kế

- [docs/FRONTEND_ADMIN.md](./docs/FRONTEND_ADMIN.md): Tài liệu kiến trúc Frontend Admin, proxy, `apiRequest`, Zustand stores và các màn hình.
- [docs/PRODUCT.md](./docs/PRODUCT.md): Mục đích sản phẩm, đối tượng sử dụng, luồng nghiệp vụ và nguyên tắc vận hành.
- [docs/DESIGN.md](./docs/DESIGN.md): Hệ thống thiết kế (bảng màu, typography, layout, elevation, shapes, components và do/don't).
- [.impeccable/design.json](./.impeccable/design.json): Sidecar metadata & HTML/CSS snippet chuẩn Impeccable v2.

## Chạy và kiểm tra cục bộ

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường phát triển
npm run dev

# Kiểm tra ESLint
npm run lint

# Build production
npm run build
```

Mở [http://localhost:3000](http://localhost:3000) sau khi chạy `npm run dev` (nếu chưa đăng nhập sẽ tự chuyển về `/login`; sau khi đăng nhập sẽ chuyển tới trang đầu tiên mà tài khoản có quyền truy cập).
