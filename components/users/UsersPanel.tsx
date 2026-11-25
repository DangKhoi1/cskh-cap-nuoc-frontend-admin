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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AssignRoleSlideOver } from "@/components/users/AssignRoleSlideOver";
import { StaffFormSlideOver } from "@/components/users/StaffFormSlideOver";

export function UsersPanel() {
  const staffPage = useRbacStore((s) => s.staffPage);
  const roles = useRbacStore((s) => s.roles);
  const loadingStaff = useRbacStore((s) => s.loadingStaff);
  const fetchStaff = useRbacStore((s) => s.fetchStaff);
  const fetchRoles = useRbacStore((s) => s.fetchRoles);
  const setStaffStatus = useRbacStore((s) => s.setStaffStatus);
  const deleteStaff = useRbacStore((s) => s.deleteStaff);

  const currentUser = useAuthStore((s) => s.currentUser);
  const currentUserId = currentUser?.id;
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
  const [userToToggle, setUserToToggle] = useState<StaffUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    if (hasPermission("roles.view") || isSystemAdmin) {
      fetchRoles().catch(() => undefined);
    }
  }, [currentUserId, fetchRoles, hasPermission, isSystemAdmin]);

  useEffect(() => {
    if (!currentUserId) return;
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
      if (
        error instanceof ApiError &&
        error.status !== 401 &&
        error.status !== 403
      ) {
        showErrorAlert(error.message);
      }
    });
  }, [
    currentUserId,
    fetchStaff,
    page,
    query,
    statusFilter,
    roleFilter,
    showErrorAlert,
  ]);

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
              onClick={() => {
                setEditingUser(null);
                setDrawerOpen(true);
              }}
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
                            onClick: () => {
                              setEditingUser(user);
                              setDrawerOpen(true);
                            },
                          },
                        ]
                      : []),
                    ...(canAssignRole
                      ? [
                          {
                            label: "Đổi vai trò",
                            icon: <UserCog className="h-3.5 w-3.5" />,
                            onClick: () => setRoleModalUser(user),
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

      <StaffFormSlideOver
        key={drawerOpen ? (editingUser?.id ?? "create") : "closed"}
        open={drawerOpen}
        editingUser={editingUser}
        roles={roles}
        onClose={() => setDrawerOpen(false)}
      />

      <AssignRoleSlideOver
        key={roleModalUser?.id ?? "closed"}
        user={roleModalUser}
        roles={roles}
        onClose={() => setRoleModalUser(null)}
      />

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
    </div>
  );
}
