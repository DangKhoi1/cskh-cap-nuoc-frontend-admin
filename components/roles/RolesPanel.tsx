"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { PermissionItem, RoleDefinition } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PermissionSelector } from "@/components/roles/PermissionSelector";

function areCodeSetsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  if (setA.size !== b.length) return false;
  return b.every((code) => setA.has(code));
}

function generateRoleCode(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function RolesPanel() {
  const roles = useRbacStore((s) => s.roles);
  const permissions = useRbacStore((s) => s.permissions);
  const loadingRoles = useRbacStore((s) => s.loadingRoles);
  const isSubmitting = useRbacStore((s) => s.isSubmitting);
  const fetchRoles = useRbacStore((s) => s.fetchRoles);
  const fetchPermissions = useRbacStore((s) => s.fetchPermissions);
  const createRole = useRbacStore((s) => s.createRole);
  const updateRole = useRbacStore((s) => s.updateRole);
  const deleteRole = useRbacStore((s) => s.deleteRole);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isSystemAdmin = useAuthStore((s) => s.isSystemAdmin());
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const canManageRoles = isSystemAdmin;
  const [searchQuery, setSearchQuery] = useState("");

  const [formMode, setFormMode] = useState<null | "create" | string>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [draftCodes, setDraftCodes] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [roleToDuplicate, setRoleToDuplicate] = useState<RoleDefinition | null>(
    null
  );
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    void Promise.all([fetchRoles(), fetchPermissions()]).catch((error) => {
      if (error instanceof ApiError && error.status !== 401 && error.status !== 403) {
        showErrorAlert(error.message);
      }
    });
  }, [currentUser, fetchRoles, fetchPermissions, showErrorAlert]);

  const editingRole = useMemo(() => {
    if (!formMode || formMode === "create") return null;
    return roles.find((r) => r.id === formMode) ?? null;
  }, [formMode, roles]);

  const isEditingAdminRole = editingRole?.code === "ADMIN";

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

  const isDirty = useMemo(() => {
    if (!formMode) return false;
    if (formMode === "create") {
      return (
        roleName.trim().length > 0 ||
        roleDesc.trim().length > 0 ||
        draftCodes.length > 0
      );
    }
    if (!editingRole) return false;
    return (
      roleName.trim() !== editingRole.name ||
      roleDesc.trim() !== editingRole.description ||
      (!isEditingAdminRole &&
        !areCodeSetsEqual(draftCodes, editingRole.permissionCodes))
    );
  }, [formMode, editingRole, isEditingAdminRole, roleName, roleDesc, draftCodes]);

  const openCreateForm = () => {
    setFormMode("create");
    setRoleName("");
    setRoleDesc("");
    setDraftCodes([]);
    setNameError(undefined);
  };

  const openEditForm = (role: RoleDefinition) => {
    setFormMode(role.id);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setDraftCodes(role.permissionCodes);
    setNameError(undefined);
  };

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

  const requestLeaveForm = () => {
    if (isDirty) {
      setLeaveConfirmOpen(true);
    } else {
      setFormMode(null);
    }
  };

  const handleSaveForm = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = roleName.trim();
    if (!cleanName) {
      setNameError("Vui lòng nhập tên vai trò.");
      return;
    }

    const duplicateName = roles.some(
      (r) =>
        r.name.toLowerCase() === cleanName.toLowerCase() &&
        r.id !== editingRole?.id
    );
    if (duplicateName) {
      setNameError("Tên vai trò này đã tồn tại, vui lòng chọn tên khác.");
      return;
    }

    setSaveConfirmOpen(true);
  };

  const confirmSaveRole = async () => {
    const cleanName = roleName.trim();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: cleanName,
          description: roleDesc.trim(),
          ...(isEditingAdminRole ? {} : { permissionCodes: draftCodes }),
        });
        showSuccessAlert(`Đã lưu vai trò "${cleanName}".`);
      } else {
        let generatedCode = generateRoleCode(cleanName) || `ROLE_${Date.now()}`;
        let suffix = 2;
        while (roles.some((r) => r.code === generatedCode)) {
          generatedCode = `${generateRoleCode(cleanName)}_${suffix}`;
          suffix += 1;
        }
        await createRole({
          code: generatedCode,
          name: cleanName,
          description: roleDesc.trim() || "Vai trò tùy chỉnh",
          permissionCodes: draftCodes,
        });
        showSuccessAlert(
          `Đã tạo vai trò "${cleanName}" với ${draftCodes.length} quyền.`
        );
      }
      setSaveConfirmOpen(false);
      setFormMode(null);
    } catch (error) {
      setSaveConfirmOpen(false);
      showErrorAlert(
        error instanceof ApiError
          ? error.message
          : "Không thể lưu vai trò, vui lòng thử lại."
      );
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
      <form onSubmit={handleSaveForm} className="animate-fade-in space-y-6" noValidate>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={requestLeaveForm}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Vai trò / {editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò"}</span>
            </button>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {editingRole ? editingRole.name : "Thêm vai trò mới"}
              </h2>
              {editingRole?.isSystem ? (
                <StatusBadge label="Mặc định" tone="info" />
              ) : null}
              {isDirty ? (
                <StatusBadge label="Chưa lưu thay đổi" tone="warning" />
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-foreground-subtle">
              Đặt tên và chọn những chức năng nhân viên được sử dụng.
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Thông tin vai trò
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="unified-role-name"
                className="block text-xs font-medium text-foreground-muted"
              >
                Tên vai trò <span className="text-danger">*</span>
              </label>
              <input
                id="unified-role-name"
                type="text"
                autoFocus
                value={roleName}
                onChange={(e) => {
                  setRoleName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
                placeholder="Ví dụ: Tổ trưởng Chăm sóc khách hàng"
                className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                  nameError
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-primary"
                }`}
              />
              {nameError ? (
                <p className="mt-1 text-xs text-danger">{nameError}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="unified-role-desc"
                className="block text-xs font-medium text-foreground-muted"
              >
                Mô tả
              </label>
              <input
                id="unified-role-desc"
                type="text"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn phạm vi công việc của vai trò"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Quyền được sử dụng
          </h3>
          <PermissionSelector
            groupedPermissions={groupedPermissions}
            selectedCodes={draftCodes}
            lockedAll={isEditingAdminRole}
            onTogglePermission={(code) =>
              setDraftCodes((prev) =>
                prev.includes(code)
                  ? prev.filter((c) => c !== code)
                  : [...prev, code]
              )
            }
            onToggleModule={(codes, enable) =>
              setDraftCodes((prev) =>
                enable
                  ? Array.from(new Set([...prev, ...codes]))
                  : prev.filter((c) => !codes.includes(c))
              )
            }
          />
        </section>

        <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border border-border bg-surface/95 px-5 py-3.5 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground-muted">
            {isDirty
              ? "Có thay đổi chưa lưu."
              : "Chưa có thay đổi mới so với cấu hình hiện tại."}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={requestLeaveForm}
              className="h-9 whitespace-nowrap rounded-lg border border-border bg-surface px-4 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isDirty && formMode !== "create")}
              className="inline-flex h-9 whitespace-nowrap items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Save className="h-3.5 w-3.5 shrink-0" />
              <span>Lưu vai trò</span>
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={leaveConfirmOpen}
          onClose={() => setLeaveConfirmOpen(false)}
          onConfirm={() => {
            setLeaveConfirmOpen(false);
            setFormMode(null);
          }}
          title="Rời khỏi biểu mẫu?"
          description="Bạn có thay đổi chưa lưu. Nếu quay lại danh sách ngay bây giờ, các chỉnh sửa thông tin và quyền vừa chọn sẽ bị hủy."
          cancelLabel="Tiếp tục chỉnh sửa"
          confirmLabel="Bỏ thay đổi & quay lại"
          tone="danger"
        />

        <ConfirmDialog
          open={saveConfirmOpen}
          onClose={() => setSaveConfirmOpen(false)}
          onConfirm={() => void confirmSaveRole()}
          title={
            editingRole ? "Xác nhận lưu vai trò" : "Xác nhận tạo vai trò mới"
          }
          description={
            <>
              Bạn có chắc chắn muốn {editingRole ? "lưu thay đổi" : "tạo"} vai
              trò{" "}
              <strong className="font-semibold text-foreground">
                {roleName.trim()}
              </strong>{" "}
              {!isEditingAdminRole ? (
                <>
                  với{" "}
                  <strong className="font-semibold text-foreground">
                    {draftCodes.length} quyền
                  </strong>{" "}
                  được cấp
                </>
              ) : null}
              ?
            </>
          }
          confirmLabel="Lưu vai trò"
          tone="primary"
        />
      </form>
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
            onClick={openCreateForm}
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
                        {role.permissionCodes.length} / {permissions.length}
                      </td>
                      {canManageRoles ? (
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(role)}
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
