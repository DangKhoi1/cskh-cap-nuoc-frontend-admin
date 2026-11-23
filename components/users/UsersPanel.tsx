"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Lock,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Unlock,
} from "lucide-react";
import { useAdminStore } from "@/services/AdminStoreContext";
import type { StaffRole, StaffUser } from "@/types";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { SlideOver } from "@/components/ui/SlideOver";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function UsersPanel() {
  const { staff, setStaff, roles, showSuccessAlert, hasPermission } =
    useAdminStore();
  const canCreate = hasPermission("users.create");
  const canUpdate = hasPermission("users.update");
  const canLock = hasPermission("users.lock");
  const hasRowActions = canUpdate || canLock;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "LOCKED">(
    "ALL"
  );
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [userToToggle, setUserToToggle] = useState<StaffUser | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<StaffRole>(roles[1]?.code ?? "CSKH");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

  const roleMap = useMemo(() => {
    const map = new Map<string, (typeof roles)[number]>();
    for (const r of roles) map.set(r.code, r);
    return map;
  }, [roles]);

  const selectedRoleObj = roleMap.get(role);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((user) => {
      if (statusFilter === "ACTIVE" && !user.active) return false;
      if (statusFilter === "LOCKED" && user.active) return false;
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      if (!q) return true;
      const roleName = roleMap.get(user.role)?.name ?? user.role;
      return (
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q) ||
        roleName.toLowerCase().includes(q)
      );
    });
  }, [staff, query, statusFilter, roleFilter, roleMap]);

  const openCreateDrawer = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setDepartment("Tổng đài Chăm sóc khách hàng");
    setRole(roles[1]?.code ?? roles[0]?.code ?? "CSKH");
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: StaffUser) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setDepartment(user.department);
    setRole(user.role);
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const handleSaveUser = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: { fullName?: string; email?: string } = {};
    if (!fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên nhân viên.";
    }
    if (!email.trim()) {
      errors.email = "Vui lòng nhập email công vụ.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaveConfirmOpen(true);
  };

  const confirmSaveUser = () => {
    if (editingUser) {
      setStaff((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                fullName: fullName.trim(),
                email: email.trim(),
                department: department.trim() || "Chưa phân công",
                role,
              }
            : u
        )
      );
      showSuccessAlert(
        `Đã cập nhật thông tin nhân viên "${fullName.trim()}".`
      );
    } else {
      const newUser: StaffUser = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim() || "Tổng đài Chăm sóc khách hàng",
        role,
        active: true,
        lastLoginAt: new Date().toISOString(),
      };
      setStaff((prev) => [newUser, ...prev]);
      showSuccessAlert(`Đã tạo tài khoản nhân viên "${fullName.trim()}".`);
    }
    setSaveConfirmOpen(false);
    setDrawerOpen(false);
  };

  const confirmToggleActive = () => {
    if (!userToToggle) return;
    const nextActive = !userToToggle.active;
    setStaff((prev) =>
      prev.map((u) =>
        u.id === userToToggle.id ? { ...u, active: nextActive } : u
      )
    );
    showSuccessAlert(
      nextActive
        ? `Đã kích hoạt lại tài khoản "${userToToggle.fullName}".`
        : `Đã tạm khóa tài khoản "${userToToggle.fullName}".`
    );
    setUserToToggle(null);
  };

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
                onClick={() => setStatusFilter(tab.value)}
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
          <div className="relative w-full sm:w-48">
            <select
              aria-label="Lọc theo vai trò"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none"
            >
              <option value="ALL">Tất cả vai trò</option>
              {roles.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
        {filtered.length === 0 ? (
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
                  {hasRowActions ? (
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => {
                  const customRoleLabel = roleMap.get(user.role)?.name;
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
                        {user.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {customRoleLabel ?? user.role}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-sm text-foreground-muted">
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                      <td className="px-4 py-3">
                        {user.active ? (
                          <StatusBadge label="Đang hoạt động" tone="success" />
                        ) : (
                          <StatusBadge label="Đã khóa" tone="neutral" />
                        )}
                      </td>
                      {hasRowActions ? (
                        <td className="px-5 py-3 text-right">
                          <ActionMenu
                            ariaLabel={`Thao tác cho ${user.fullName}`}
                            items={[
                              ...(canUpdate
                                ? [
                                    {
                                      label: "Sửa thông tin nhân viên",
                                      icon: <Pencil className="h-3.5 w-3.5" />,
                                      onClick: () => openEditDrawer(user),
                                    },
                                  ]
                                : []),
                              ...(canLock
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
                            ]}
                          />
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
              ) : null}
            </div>

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
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
              </div>
              {selectedRoleObj ? (
                <p className="mt-1.5 text-xs text-foreground-subtle">
                  {selectedRoleObj.description} ({selectedRoleObj.permissionCodes.length} quyền)
                </p>
              ) : null}
            </div>
          </div>

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
              className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(userToToggle)}
        onClose={() => setUserToToggle(null)}
        onConfirm={confirmToggleActive}
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
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={confirmSaveUser}
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
            </strong>{" "}
            với vai trò{" "}
            <strong className="font-semibold text-foreground">
              {roleMap.get(role)?.name ?? role}
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
