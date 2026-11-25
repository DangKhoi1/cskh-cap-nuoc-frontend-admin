"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { PermissionItem, RoleDefinition } from "@/types";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { generateRoleCode, RoleFormView } from "@/components/roles/RoleFormView";

export function RolesPanel() {
  const roles = useRbacStore((s) => s.roles);
  const permissions = useRbacStore((s) => s.permissions);
  const loadingRoles = useRbacStore((s) => s.loadingRoles);
  const fetchRoles = useRbacStore((s) => s.fetchRoles);
  const fetchPermissions = useRbacStore((s) => s.fetchPermissions);
  const createRole = useRbacStore((s) => s.createRole);
  const deleteRole = useRbacStore((s) => s.deleteRole);
  const currentUserId = useAuthStore((s) => s.currentUser?.id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const isSystemAdmin = useAuthStore((s) => s.isSystemAdmin());
  const canViewPermissions = hasPermission("permissions.view") || isSystemAdmin;
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const canManageRoles = isSystemAdmin;
  const [searchQuery, setSearchQuery] = useState("");
  const [formMode, setFormMode] = useState<null | "create" | string>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [roleToDuplicate, setRoleToDuplicate] = useState<RoleDefinition | null>(
    null
  );

  useEffect(() => {
    if (!currentUserId) return;
    const tasks: Array<Promise<void>> = [fetchRoles()];
    if (canViewPermissions) {
      tasks.push(fetchPermissions());
    }
    void Promise.all(tasks).catch((error) => {
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
    canViewPermissions,
    fetchRoles,
    fetchPermissions,
    showErrorAlert,
  ]);

  const editingRole = useMemo(() => {
    if (!formMode || formMode === "create") return null;
    return roles.find((r) => r.id === formMode) ?? null;
  }, [formMode, roles]);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionItem[]>();
    for (const perm of permissions) {
      const list = groups.get(perm.module) ?? [];
      list.push(perm);
      groups.set(perm.module, list);
    }
    return Array.from(groups.entries());
  }, [permissions]);

  const confirmDuplicateRole = async () => {
    if (!roleToDuplicate) return;
    const baseName = `${roleToDuplicate.name} (Bản sao)`;
    let candidateCode = generateRoleCode(baseName) || `ROLE_${Date.now()}`;
    let suffix = 2;
    while (roles.some((r) => r.code === candidateCode)) {
      candidateCode = `${generateRoleCode(roleToDuplicate.name)}_${suffix}`;
      suffix += 1;
    }
    const adminOnlySet = new Set(
      permissions.filter((p) => p.adminOnly).map((p) => p.code)
    );
    const copyableCodes = roleToDuplicate.permissionCodes.filter(
      (code) => !adminOnlySet.has(code)
    );

    try {
      await createRole({
        code: candidateCode,
        name: baseName,
        description: roleToDuplicate.description,
        permissionCodes: copyableCodes,
      });
      showSuccessAlert(`Đã nhân bản vai trò "${roleToDuplicate.name}".`);
    } catch (error) {
      if (error instanceof ApiError) showErrorAlert(error.message);
    } finally {
      setRoleToDuplicate(null);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete || roleToDelete.isSystem) return;
    try {
      await deleteRole(roleToDelete.id);
      showSuccessAlert(`Đã xóa vai trò "${roleToDelete.name}".`);
    } catch (error) {
      if (error instanceof ApiError) showErrorAlert(error.message);
    } finally {
      setRoleToDelete(null);
    }
  };

  if (formMode) {
    return (
      <RoleFormView
        key={editingRole?.id ?? "create"}
        editingRole={editingRole}
        roles={roles}
        groupedPermissions={groupedPermissions}
        onClose={() => setFormMode(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm vai trò..."
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>

        {canManageRoles ? (
          <button
            type="button"
            onClick={() => setFormMode("create")}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm vai trò</span>
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loadingRoles && roles.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-foreground-muted">
            Đang tải danh sách vai trò...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <ShieldCheck className="h-8 w-8 text-foreground-subtle" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Không tìm thấy vai trò phù hợp
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Xóa từ khóa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-medium text-foreground-muted">
                <tr>
                  <th className="px-5 py-3">Tên vai trò</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3 text-right">Nhân viên</th>
                  <th className="px-4 py-3 text-right">Quyền được cấp</th>
                  {canManageRoles ? (
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRoles.map((role) => {
                  const assignedCount = role.userCount ?? 0;
                  const cannotDelete = role.isSystem || assignedCount > 0;
                  const secondaryActions = [
                    {
                      label: "Nhân bản vai trò",
                      icon: <Copy className="h-3.5 w-3.5" />,
                      onClick: () => setRoleToDuplicate(role),
                    },
                    {
                      label: role.isSystem
                        ? "Vai trò mặc định (khóa xóa)"
                        : assignedCount > 0
                          ? `Đang có ${assignedCount} nhân viên (khóa xóa)`
                          : "Xóa vai trò",
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      tone: "danger" as const,
                      disabled: cannotDelete,
                      onClick: () => setRoleToDelete(role),
                    },
                  ];
                  return (
                    <tr
                      key={role.id}
                      className="transition-colors duration-150 hover:bg-surface-hover"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-foreground">
                            {role.name}
                          </span>
                          {role.code === "ADMIN" ? (
                            <StatusBadge label="Toàn quyền hệ thống" tone="info" />
                          ) : role.isSystem ? (
                            <StatusBadge label="Mặc định" tone="neutral" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        {role.description}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {assignedCount}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {permissions.length > 0
                          ? `${role.permissionCodes.length} / ${permissions.length}`
                          : `${role.permissionCodes.length}`}
                      </td>
                      {canManageRoles ? (
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setFormMode(role.id)}
                              className="inline-flex h-8 whitespace-nowrap items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Chỉnh sửa</span>
                            </button>

                            <ActionMenu
                              ariaLabel={`Thao tác phụ cho vai trò ${role.name}`}
                              items={secondaryActions}
                            />
                          </div>
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

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => void confirmDeleteRole()}
        title="Xác nhận xóa vai trò"
        description={
          roleToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa vai trò{" "}
              <strong className="font-semibold text-foreground">
                {roleToDelete.name}
              </strong>{" "}
              khỏi hệ thống không?
            </>
          ) : null
        }
        confirmLabel="Xác nhận xóa"
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(roleToDuplicate)}
        onClose={() => setRoleToDuplicate(null)}
        onConfirm={() => void confirmDuplicateRole()}
        title="Xác nhận nhân bản vai trò"
        description={
          roleToDuplicate ? (
            <>
              Bạn có chắc chắn muốn tạo bản sao từ vai trò{" "}
              <strong className="font-semibold text-foreground">
                {roleToDuplicate.name}
              </strong>{" "}
              ?
            </>
          ) : null
        }
        confirmLabel="Nhân bản"
        tone="primary"
      />
    </div>
  );
}
