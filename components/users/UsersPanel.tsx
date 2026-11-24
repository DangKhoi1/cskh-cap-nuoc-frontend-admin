"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Lock,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCog,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { useAlertStore } from "@/stores/alert.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { StaffUser } from "@/types";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SlideOver } from "@/components/ui/SlideOver";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function UsersPanel() {
  const staffPage = useRbacStore((s) => s.staffPage);
  const roles = useRbacStore((s) => s.roles);
  const loadingStaff = useRbacStore((s) => s.loadingStaff);
  const isSubmitting = useRbacStore((s) => s.isSubmitting);
  const fetchStaff = useRbacStore((s) => s.fetchStaff);
  const fetchRoles = useRbacStore((s) => s.fetchRoles);
  const createStaff = useRbacStore((s) => s.createStaff);
  const updateStaff = useRbacStore((s) => s.updateStaff);
  const assignStaffRole = useRbacStore((s) => s.assignStaffRole);
  const setStaffStatus = useRbacStore((s) => s.setStaffStatus);
  const deleteStaff = useRbacStore((s) => s.deleteStaff);

  const currentUser = useAuthStore((s) => s.currentUser);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const isSystemAdmin = useAuthStore((s) => s.isSystemAdmin());
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const canCreate = isSystemAdmin;
  const canAssignRole = isSystemAdmin;
  const canUpdate = hasPermission("users.update");
  const canLock = hasPermission("users.lock");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "LOCKED">(
    "ALL"
  );
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<StaffUser | null>(null);
  const [nextRoleId, setNextRoleId] = useState("");
  const [userToToggle, setUserToToggle] = useState<StaffUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [roleId, setRoleId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    roleId?: string;
  }>({});

  useEffect(() => {
    if (!currentUser) return;
    if (hasPermission("roles.view") || isSystemAdmin) {
      fetchRoles().catch(() => undefined);
    }
  }, [currentUser, fetchRoles, hasPermission, isSystemAdmin]);

  useEffect(() => {
    if (!currentUser) return;
    const activeParam =
      statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE";
    const roleIdParam = roleFilter === "ALL" ? undefined : roleFilter;

    fetchStaff({
      page,
      limit: 10,
      search: query,
      roleId: roleIdParam,
      active: activeParam,
    }).catch((error) => {
      if (error instanceof ApiError && error.status !== 401 && error.status !== 403) {
        showErrorAlert(error.message);
      }
    });
  }, [currentUser, fetchStaff, page, query, statusFilter, roleFilter, showErrorAlert]);

  const openCreateDrawer = () => {
    const defaultRole =
      roles.find((r) => r.code !== "ADMIN") ?? roles[0] ?? null;
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setDepartment("Tổng đài Chăm sóc khách hàng");
    setRoleId(defaultRole?.id ?? "");
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: StaffUser) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setPassword("");
    setDepartment(user.department);
    setRoleId(user.roleId);
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openRoleModal = (user: StaffUser) => {
    setRoleModalUser(user);
    setNextRoleId(user.roleId);
  };

  const handleSaveUser = (event: React.FormEvent) => {
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
      setDrawerOpen(false);
    } catch (error) {
      setSaveConfirmOpen(false);
      showErrorAlert(
        error instanceof ApiError
          ? error.message
          : "Không thể lưu thông tin nhân viên, vui lòng thử lại."
      );
    }
  };

  const confirmAssignRole = async () => {
    if (!roleModalUser || !nextRoleId) return;
    try {
      await assignStaffRole(roleModalUser.id, nextRoleId);
      showSuccessAlert(
        `Đã cập nhật vai trò cho nhân viên "${roleModalUser.fullName}".`
      );
      setRoleModalUser(null);
    } catch (error) {
      if (error instanceof ApiError) showErrorAlert(error.message);
    }
  };

  const confirmToggleActive = async () => {
    if (!userToToggle) return;
    const nextActive = !userToToggle.active;
    try {
      await setStaffStatus(userToToggle.id, nextActive);
      showSuccessAlert(
        nextActive
          ? `Đã kích hoạt lại tài khoản "${userToToggle.fullName}".`
          : `Đã tạm khóa tài khoản "${userToToggle.fullName}".`
      );
    } catch (error) {
      if (error instanceof ApiError) showErrorAlert(error.message);
    } finally {
      setUserToToggle(null);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!userToDelete) return;
    try {
      await deleteStaff(userToDelete.id);
      showSuccessAlert(
        `Đã xóa tài khoản nhân viên "${userToDelete.fullName}".`
      );
    } catch (error) {
      showErrorAlert(
        error instanceof ApiError
          ? error.message
          : "Không thể xóa tài khoản nhân viên."
      );
    } finally {
      setUserToDelete(null);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(staffPage.total / Math.max(1, staffPage.limit))
  );
  const selectedRoleObj = roles.find((r) => r.id === roleId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { value: "ALL", label: "Tất cả" },
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "LOCKED", label: "Đã khóa" },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {roles.length > 0 ? (
            <div className="relative w-full sm:w-48">
              <select
                aria-label="Lọc theo vai trò"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none"
              >
                <option value="ALL">Tất cả vai trò</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            </div>
          ) : null}

          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên, email, bộ phận..."
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {canCreate ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-9 shrink-0 whitespace-nowrap items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm nhân viên</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loadingStaff && staffPage.items.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-foreground-muted">
            Đang tải danh sách nhân viên...
          </div>
        ) : staffPage.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <ShieldCheck className="h-8 w-8 text-foreground-subtle" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Không tìm thấy tài khoản nhân viên phù hợp
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
                setRoleFilter("ALL");
                setPage(1);
              }}
              className="mt-4 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-medium text-foreground-muted">
                <tr>
                  <th className="px-5 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Đơn vị / Bộ phận</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Đăng nhập gần nhất</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffPage.items.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const canToggleThisUser =
                    canLock &&
                    !isSelf &&
                    (user.role !== "ADMIN" || isSystemAdmin);

                  const rowActions = [
                    ...(canUpdate
                      ? [
                          {
                            label: "Sửa thông tin nhân viên",
                            icon: <Pencil className="h-3.5 w-3.5" />,
                            onClick: () => openEditDrawer(user),
                          },
                        ]
                      : []),
                    ...(canAssignRole
                      ? [
                          {
                            label: "Đổi vai trò",
                            icon: <UserCog className="h-3.5 w-3.5" />,
                            onClick: () => openRoleModal(user),
                          },
                        ]
                      : []),
                    ...(canToggleThisUser
                      ? [
                          {
                            label: user.active
                              ? "Tạm khóa tài khoản"
                              : "Kích hoạt lại tài khoản",
                            icon: user.active ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            ),
                            onClick: () => setUserToToggle(user),
                          },
                        ]
                      : []),
                    ...(isSystemAdmin && !isSelf
                      ? [
                          {
                            label: "Xóa tài khoản",
                            icon: <Trash2 className="h-3.5 w-3.5" />,
                            tone: "danger" as const,
                            onClick: () => setUserToDelete(user),
                          },
                        ]
                      : []),
                  ];

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors duration-150 hover:bg-surface-hover"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">
                          {user.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-foreground-subtle">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        {user.department || "Chưa phân công"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.roleName || user.role}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-sm text-foreground-muted">
                        {user.lastLoginAt
                          ? formatDateTime(user.lastLoginAt)
                          : "Chưa đăng nhập"}
                      </td>
                      <td className="px-4 py-3">
                        {user.active ? (
                          <StatusBadge label="Đang hoạt động" tone="success" />
                        ) : (
                          <StatusBadge label="Đã khóa" tone="neutral" />
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {rowActions.length > 0 ? (
                          <ActionMenu
                            ariaLabel={`Thao tác cho ${user.fullName}`}
                            items={rowActions}
                          />
                        ) : (
                          <span className="text-xs text-foreground-subtle">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {staffPage.total > 0 ? (
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span className="tabular-nums">
            Tổng {staffPage.total} nhân viên · Trang {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-lg border border-border bg-surface px-3 font-medium text-foreground hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-lg border border-border bg-surface px-3 font-medium text-foreground hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              Sau
            </button>
          </div>
        </div>
      ) : null}

      <SlideOver
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingUser ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        subtitle={
          editingUser
            ? editingUser.email
            : "Tạo tài khoản truy cập cổng Chăm sóc khách hàng"
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-6" noValidate>
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
                    setFieldErrors((prev) => ({
                      ...prev,
                      fullName: undefined,
                    }));
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
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
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
              onClick={() => setDrawerOpen(false)}
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

      <SlideOver
        open={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        title="Đổi vai trò nhân viên"
        subtitle={
          roleModalUser
            ? `${roleModalUser.fullName} · ${roleModalUser.email}`
            : ""
        }
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="assign-staff-role"
              className="block text-xs font-medium text-foreground-muted"
            >
              Vai trò mới
            </label>
            <div className="relative mt-1.5">
              <select
                id="assign-staff-role"
                value={nextRoleId}
                onChange={(e) => setNextRoleId(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRoleModalUser(null)}
              className="h-9 rounded-lg border border-border bg-surface px-4 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting || !nextRoleId}
              onClick={() => void confirmAssignRole()}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              Cập nhật vai trò
            </button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(userToToggle)}
        onClose={() => setUserToToggle(null)}
        onConfirm={() => void confirmToggleActive()}
        title={
          userToToggle?.active
            ? "Xác nhận tạm khóa tài khoản"
            : "Xác nhận kích hoạt tài khoản"
        }
        description={
          userToToggle ? (
            <>
              Bạn có chắc chắn muốn{" "}
              {userToToggle.active ? "tạm khóa" : "kích hoạt lại"} tài khoản
              của nhân viên{" "}
              <strong className="font-semibold text-foreground">
                {userToToggle.fullName}
              </strong>{" "}
              ({userToToggle.email}) không?
            </>
          ) : null
        }
        confirmLabel={
          userToToggle?.active ? "Tạm khóa tài khoản" : "Kích hoạt lại"
        }
        tone={userToToggle?.active ? "danger" : "primary"}
      />

      <ConfirmDialog
        open={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => void confirmDeleteStaff()}
        title="Xác nhận xóa tài khoản nhân viên"
        description={
          userToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của nhân viên{" "}
              <strong className="font-semibold text-foreground">
                {userToDelete.fullName}
              </strong>{" "}
              ({userToDelete.email}) không?
            </>
          ) : null
        }
        confirmLabel="Xóa tài khoản"
        tone="danger"
      />

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
    </div>
  );
}
