# CSKH Cấp Nước — Cổng Quản Trị (Frontend Admin)

Giao diện quản trị nội bộ cho hệ thống Chăm sóc khách hàng ngành Cấp nước, xây dựng bằng Next.js App Router, React, TypeScript và Tailwind CSS v4.

## Công nghệ sử dụng

- **Framework:** Next.js `16.4.6` (App Router, Turbopack)
- **Ngôn ngữ:** React `19.3`, TypeScript `5`
- **Styling:** Tailwind CSS `4.3` với CSS Variables hỗ trợ Sáng / Tối (`data-theme="dark"`)
- **Icons:** `lucide-react`
- **Typography:** `Inter` và `JetBrains Mono` qua `next/font/google`

## Cấu trúc thư mục chính

```text
app/
├── customers/page.tsx      # Quản lý liên kết khách hàng (đối chiếu V2 theo mã KH + SĐT)
├── users/page.tsx          # Quản lý tài khoản nhân viên
├── roles/page.tsx          # Quản lý vai trò & gán quyền theo phân hệ
├── permissions/page.tsx    # Danh mục quyền hệ thống (chỉ đọc)
├── login/page.tsx          # Màn hình đăng nhập
├── globals.css             # Token màu sắc, font, animation và prefers-reduced-motion
└── layout.tsx              # Root layout bọc AdminShell

components/
├── layout/AdminShell.tsx   # Sidebar phân quyền, header chuyển user/theme, route guard & alert
├── roles/
│   ├── RolesPanel.tsx      # Bảng vai trò & biểu mẫu hợp nhất tạo/sửa vai trò
│   └── PermissionSelector.tsx # Bộ chọn quyền nhóm theo phân hệ
├── users/UsersPanel.tsx    # Bảng nhân viên & SlideOver thêm/sửa nhân viên
├── permissions/PermissionsPanel.tsx
└── ui/                     # ActionMenu, ConfirmDialog (Portal), SlideOver (Portal), StatusBadge

services/
├── AdminStoreContext.tsx   # State dùng chung, hasPermission(), quản lý alert toàn cục
└── mock-data.ts            # Dữ liệu mẫu nhân viên, vai trò, danh mục quyền & khách hàng

types/index.ts              # Định nghĩa kiểu dữ liệu CustomerLinkItem, StaffUser, RoleDefinition, PermissionItem
lib/format.ts               # Định dạng tiền tệ VND và ngày giờ vi-VN
```

## Cơ chế phân quyền (RBAC) hiện tại

- Danh mục quyền được định nghĩa sẵn trong `MOCK_PERMISSIONS` (`customers.*`, `users.*`, `roles.*`, `permissions.view`).
- `AdminStoreContext` tính toán `currentPermissionCodes` dựa trên vai trò đang gán cho `currentUser` (tự động trả về `[]` nếu tài khoản bị khóa `active: false`).
- `AdminShell` dùng `hasPermission(...)` để lọc các mục sidebar, ẩn nhóm menu trống và chặn nội dung trang nếu người dùng hiện tại không còn quyền truy cập route đang mở.
- Các màn hình `customers`, `users`, `roles` dùng `hasPermission(...)` để ẩn/hiện các nút thêm, sửa, xóa, nhân bản và khóa tài khoản.
- Có sẵn bộ chuyển người dùng mẫu ngay trên header để kiểm thử nhanh hành vi phân quyền theo từng tài khoản.

## Tài liệu sản phẩm & thiết kế

- [docs/FRONTEND-ADMIN.md](./docs/FRONTEND-ADMIN.md): Tài liệu tổng hợp kiến trúc frontend, ma trận phân quyền RBAC, luồng nghiệp vụ và quy ước component.
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

Mở [http://localhost:3000](http://localhost:3000) sau khi chạy `npm run dev` (tự động chuyển hướng tới `/customers`).
