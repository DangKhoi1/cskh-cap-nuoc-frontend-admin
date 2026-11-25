"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { PermissionItem, RoleDefinition } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PermissionSelector } from "@/components/roles/PermissionSelector";

export function generateRoleCode(name: string): string {
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

function areCodeSetsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  if (setA.size !== b.length) return false;
  return b.every((code) => setA.has(code));
}

interface RoleFormViewProps {
  editingRole: RoleDefinition | null;
  roles: RoleDefinition[];
  groupedPermissions: Array<[string, PermissionItem[]]>;
  onClose: () => void;
}

export function RoleFormView({
  editingRole,
  roles,
  groupedPermissions,
  onClose,
}: RoleFormViewProps) {
  const isSubmitting = useRbacStore((s) => s.isSubmitting);
  const createRole = useRbacStore((s) => s.createRole);
  const updateRole = useRbacStore((s) => s.updateRole);
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const isEditingAdminRole = editingRole?.code === "ADMIN";
  const [roleName, setRoleName] = useState(editingRole?.name ?? "");
  const [roleDesc, setRoleDesc] = useState(editingRole?.description ?? "");
  const [draftCodes, setDraftCodes] = useState<string[]>(
    editingRole?.permissionCodes ?? []
  );
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const isDirty = useMemo(() => {
    if (!editingRole) {
      return (
        roleName.trim().length > 0 ||
        roleDesc.trim().length > 0 ||
        draftCodes.length > 0
      );
    }
    return (
      roleName.trim() !== editingRole.name ||
      roleDesc.trim() !== editingRole.description ||
      (!isEditingAdminRole &&
        !areCodeSetsEqual(draftCodes, editingRole.permissionCodes))
    );
  }, [editingRole, isEditingAdminRole, roleName, roleDesc, draftCodes]);

  const requestLeaveForm = () => {
    if (isDirty) {
      setLeaveConfirmOpen(true);
    } else {
      onClose();
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
      onClose();
    } catch (error) {
      setSaveConfirmOpen(false);
      showErrorAlert(
        error instanceof ApiError
          ? error.message
          : "Không thể lưu vai trò, vui lòng thử lại."
      );
    }
  };

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
            disabled={isSubmitting || (!isDirty && Boolean(editingRole))}
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
          onClose();
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
