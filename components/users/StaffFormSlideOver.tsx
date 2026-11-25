"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { RoleDefinition, StaffUser } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SlideOver } from "@/components/ui/SlideOver";

interface StaffFormSlideOverProps {
  open: boolean;
  editingUser: StaffUser | null;
  roles: RoleDefinition[];
  onClose: () => void;
}

export function StaffFormSlideOver({
  open,
  editingUser,
  roles,
  onClose,
}: StaffFormSlideOverProps) {
  const isSubmitting = useRbacStore((s) => s.isSubmitting);
  const createStaff = useRbacStore((s) => s.createStaff);
  const updateStaff = useRbacStore((s) => s.updateStaff);
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const defaultRoleId =
    (roles.find((r) => r.code !== "ADMIN") ?? roles[0])?.id ?? "";

  const [fullName, setFullName] = useState(editingUser?.fullName ?? "");
  const [email, setEmail] = useState(editingUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(
    editingUser?.department ?? "Tổng đài Chăm sóc khách hàng"
  );
  const [roleId, setRoleId] = useState(editingUser?.roleId ?? defaultRoleId);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    roleId?: string;
  }>({});
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const selectedRoleObj = roles.find((r) => r.id === roleId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên nhân viên.";
    }
    if (!editingUser) {
      if (!email.trim()) {
        errors.email = "Vui lòng nhập email công vụ.";
      }
      if (!password || password.length < 6) {
        errors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
      }
      if (!roleId) {
        errors.roleId = "Vui lòng chọn vai trò.";
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaveConfirmOpen(true);
  };

  const confirmSaveUser = async () => {
    try {
      if (editingUser) {
        await updateStaff(editingUser.id, {
          fullName: fullName.trim(),
          department: department.trim() || "Chưa phân công",
        });
        showSuccessAlert(
          `Đã cập nhật thông tin nhân viên "${fullName.trim()}".`
        );
      } else {
        await createStaff({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          roleId,
          department: department.trim() || "Tổng đài Chăm sóc khách hàng",
        });
        showSuccessAlert(`Đã tạo tài khoản nhân viên "${fullName.trim()}".`);
      }
      setSaveConfirmOpen(false);
      onClose();
    } catch (error) {
      setSaveConfirmOpen(false);
      showErrorAlert(
        error instanceof ApiError
          ? error.message
          : "Không thể lưu thông tin nhân viên, vui lòng thử lại."
      );
    }
  };

  return (
    <>
      <SlideOver
        open={open}
        onClose={onClose}
        title={editingUser ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        subtitle={
          editingUser
            ? editingUser.email
            : "Tạo tài khoản truy cập cổng Chăm sóc khách hàng"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Thông tin nhân viên
            </h3>

            <div>
              <label
                htmlFor="staff-fullname"
                className="block text-xs font-medium text-foreground-muted"
              >
                Họ và tên <span className="text-danger">*</span>
              </label>
              <input
                id="staff-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                placeholder="Ví dụ: Trần Văn An"
                className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                  fieldErrors.fullName
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-primary"
                }`}
              />
              {fieldErrors.fullName ? (
                <p className="mt-1 text-xs text-danger">
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>

            {!editingUser ? (
              <>
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-xs font-medium text-foreground-muted"
                  >
                    Email công vụ <span className="text-danger">*</span>
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }
                    }}
                    placeholder="an.tv@capnuoc.vn"
                    className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                      fieldErrors.email
                        ? "border-danger focus:border-danger"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-1 text-xs text-danger">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="staff-password"
                    className="block text-xs font-medium text-foreground-muted"
                  >
                    Mật khẩu khởi tạo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    placeholder="Tối thiểu 6 ký tự"
                    className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                      fieldErrors.password
                        ? "border-danger focus:border-danger"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  {fieldErrors.password ? (
                    <p className="mt-1 text-xs text-danger">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div>
              <label
                htmlFor="staff-dept"
                className="block text-xs font-medium text-foreground-muted"
              >
                Đơn vị / Bộ phận
              </label>
              <input
                id="staff-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Tổng đài Chăm sóc khách hàng / Quầy giao dịch"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {!editingUser ? (
            <div className="space-y-3 border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground">
                Quyền truy cập
              </h3>

              <div>
                <label
                  htmlFor="staff-role"
                  className="block text-xs font-medium text-foreground-muted"
                >
                  Vai trò <span className="text-danger">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="staff-role"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
                </div>
                {selectedRoleObj ? (
                  <p className="mt-1.5 text-xs text-foreground-subtle">
                    {selectedRoleObj.description} (
                    {selectedRoleObj.permissionCodes.length} quyền)
                  </p>
                ) : null}
                {fieldErrors.roleId ? (
                  <p className="mt-1 text-xs text-danger">
                    {fieldErrors.roleId}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-border bg-surface px-4 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={() => void confirmSaveUser()}
        title={
          editingUser
            ? "Xác nhận lưu thông tin nhân viên"
            : "Xác nhận tạo tài khoản nhân viên"
        }
        description={
          <>
            Bạn có chắc chắn muốn{" "}
            {editingUser ? "lưu thay đổi cho" : "tạo tài khoản"}{" "}
            <strong className="font-semibold text-foreground">
              {fullName.trim()}
            </strong>
            ?
          </>
        }
        confirmLabel={editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
        tone="primary"
      />
    </>
  );
}
