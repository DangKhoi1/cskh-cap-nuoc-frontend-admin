# Tài liệu Frontend Quản trị (`cskh-cap-nuoc-frontend-admin`)

## 0. Mô tả luồng bằng lời

Toàn bộ yêu cầu API từ trình duyệt trên cổng Quản trị (`localhost:3000`) đều đi qua đường dẫn `/api/backend/...` và được Next.js rewrite sang backend (`localhost:8080`) để cùng origin, nhờ đó cookie phiên nhân viên `cskh-staff.session_token` tự động đi kèm mà không gặp lỗi CORS. Khi người dùng mở ứng dụng, `AdminShell` gọi `initSession()` (`GET /admin/me`) để lấy thông tin tài khoản và danh sách quyền `permissionCodes`. Nếu chưa đăng nhập (`401`), hệ thống tự xóa state và đưa về `/login`; nếu thao tác bị từ chối quyền (`403`), hệ thống hiện thông báo lỗi và gọi lại `/admin/me` để đồng bộ quyền mới nhất. Dựa trên danh sách quyền, sidebar và các nút thao tác sẽ tự ẩn hoặc hiện tương ứng. Mọi phản hồi dạng `{ EC, EM, data }` từ backend được `apiRequest` tự động mở bọc lấy `data` để các Zustand store (`useRbacStore`, `useAuthStore`) sử dụng trực tiếp; khi bấm đăng xuất, Frontend gọi `/auth/staff/logout`, dọn sạch state, quay về `/login` và hiển thị thông báo tiếng Việt `"Đăng xuất thành công."`.

---

## 1. Công nghệ & Cơ chế kết nối Backend

- **Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand 5.
- **Proxy cùng origin ([next.config.ts](../../cskh-cap-nuoc-frontend-admin/next.config.ts)):**
  - Rewrite `/api/backend/:path*` → `${BACKEND_URL}/:path*` (mặc định `http://localhost:8080`).
  - Mọi request từ trình duyệt gửi tới `/api/backend/*` cùng origin nên cookie `HttpOnly` (`cskh-staff.session_token`) được trình duyệt tự đính kèm mà không gặp lỗi cross-site cookie.
- **HTTP Client ([lib/api-client.ts](../../cskh-cap-nuoc-frontend-admin/lib/api-client.ts)):**
  - Dùng `fetch` với `credentials: "include"`.
  - Tự động mở bọc `payload.data` nếu response có cả `EC` và `data` (khớp chuẩn `{ EC: 1, EM, data }` của backend `/admin/*`).
  - Khi gặp lỗi (`!response.ok`): ném `ApiError(status, rawMessage, errors)` và gọi callback từ `registerApiAuthHandlers`:
    - `401` → xóa auth state và điều hướng về `/login`.
    - `403` → hiện thông báo lỗi và gọi `refreshMe()` để đồng bộ lại quyền thực tế.

---

## 2. API Services & Zustand Stores

### 2.1 `services/api/`
- [auth.api.ts](../../cskh-cap-nuoc-frontend-admin/services/api/auth.api.ts): `POST /auth/staff/login`, `POST /auth/staff/logout`, `GET /admin/me`.
- [permissions.api.ts](../../cskh-cap-nuoc-frontend-admin/services/api/permissions.api.ts): `GET /admin/get-permissions`.
- [roles.api.ts](../../cskh-cap-nuoc-frontend-admin/services/api/roles.api.ts): `GET /admin/get-roles`, `POST /admin/create-role`, `PATCH /admin/update-role/:id`, `DELETE /admin/delete-role/:id`.
- [staff.api.ts](../../cskh-cap-nuoc-frontend-admin/services/api/staff.api.ts): `GET /admin/get-staff`, `POST /admin/create-staff`, `PATCH /admin/update-staff/:id`, `PATCH /admin/assign-staff-role/:id`, `PATCH /admin/update-staff-status/:id`, `DELETE /admin/delete-staff/:id`.

### 2.2 `stores/`
- [auth.store.ts](../../cskh-cap-nuoc-frontend-admin/stores/auth.store.ts):
  - `initSession()`, `login(email, password)`, `logout()` (luôn hiển thị toast tiếng Việt `"Đăng xuất thành công."`), `refreshMe()`, `clearAuth()`, `hasPermission(code)`, `isSystemAdmin()`.
- [rbac.store.ts](../../cskh-cap-nuoc-frontend-admin/stores/rbac.store.ts):
  - Dùng helper `runWithFlag()` quản lý `loadingPermissions`, `loadingRoles`, `loadingStaff`, `isSubmitting`.
  - Tự động gọi `useAuthStore.getState().refreshMe()` khi chỉnh sửa vai trò hoặc hồ sơ của chính user đang đăng nhập.
- [alert.store.ts](../../cskh-cap-nuoc-frontend-admin/stores/alert.store.ts): Quản lý danh sách toast (tự đóng sau 4.5s).

---

## 3. Các màn hình & Component chính

| Route / File | Chức năng | Ghi chú |
|---|---|---|
| `/login` ([app/login/page.tsx](../../cskh-cap-nuoc-frontend-admin/app/login/page.tsx)) | Đăng nhập nhân viên | Validate email/mật khẩu, lưu theme, hiển thị lỗi từ API. |
| `/` ([app/page.tsx](../../cskh-cap-nuoc-frontend-admin/app/page.tsx)) | Trang gốc điều hướng | Tự redirect sang mục đầu tiên người dùng có quyền (`/users`, `/roles`, `/permissions`, `/customers`). |
| Layout ([AdminShell.tsx](../../cskh-cap-nuoc-frontend-admin/components/layout/AdminShell.tsx) & [AlertToastContainer.tsx](../../cskh-cap-nuoc-frontend-admin/components/layout/AlertToastContainer.tsx)) | Khung quản trị & Guard | Kiểm tra `initSession()`, ẩn menu không có quyền, chặn truy cập trang trái phép, render toast toàn cục (kể cả trên `/login`). |
| `/users` ([UsersPanel.tsx](../../cskh-cap-nuoc-frontend-admin/components/users/UsersPanel.tsx), [StaffFormSlideOver.tsx](../../cskh-cap-nuoc-frontend-admin/components/users/StaffFormSlideOver.tsx), [AssignRoleSlideOver.tsx](../../cskh-cap-nuoc-frontend-admin/components/users/AssignRoleSlideOver.tsx)) | Quản lý nhân viên | Lọc trạng thái/vai trò, tìm kiếm, phân trang, tạo/sửa, đổi vai trò, khóa/mở khóa, xóa. |
| `/roles` ([RolesPanel.tsx](../../cskh-cap-nuoc-frontend-admin/components/roles/RolesPanel.tsx), [RoleFormView.tsx](../../cskh-cap-nuoc-frontend-admin/components/roles/RoleFormView.tsx), [PermissionSelector.tsx](../../cskh-cap-nuoc-frontend-admin/components/roles/PermissionSelector.tsx)) | Quản lý vai trò | Tạo/sửa vai trò có cảnh báo thay đổi chưa lưu, nhân bản vai trò (lọc bỏ quyền `adminOnly`), khóa quyền `ADMIN`. |
| `/permissions` ([PermissionsPanel.tsx](../../cskh-cap-nuoc-frontend-admin/components/permissions/PermissionsPanel.tsx)) | Danh mục quyền | Chỉ xem và lọc theo phân hệ (`module`). |
| `/customers` ([app/customers/page.tsx](../../cskh-cap-nuoc-frontend-admin/app/customers/page.tsx)) | Quản lý khách hàng | Hiện tại dùng dữ liệu giả `MOCK_CUSTOMERS` (chờ API `/admin/customers` ở backend). |
