"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useRbacStore } from "@/stores/rbac.store";
import type { RoleDefinition, StaffUser } from "@/types";
import { SlideOver } from "@/components/ui/SlideOver";

interface AssignRoleSlideOverProps {
  user: StaffUser | null;
  roles: RoleDefinition[];
  onClose: () => void;
}

export function AssignRoleSlideOver({
  user,
  roles,
  onClose,
}: AssignRoleSlideOverProps) {
  const isSubmitting = useRbacStore((s) => s.isSubmitting);
  const assignStaffRole = useRbacStore((s) => s.assignStaffRole);
  const showSuccessAlert = useAlertStore((s) => s.showSuccessAlert);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const [nextRoleId, setNextRoleId] = useState(user?.roleId ?? "");

  const confirmAssignRole = async () => {
    if (!user || !nextRoleId) return;
    try {
      await assignStaffRole(user.id, nextRoleId);
      showSuccessAlert(`Đã cập nhật vai trò cho nhân viên "${user.fullName}".`);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) showErrorAlert(error.message);
    }
  };

  return (
    <SlideOver
      open={Boolean(user)}
      onClose={onClose}
      title="Đổi vai trò nhân viên"
      subtitle={user ? `${user.fullName} · ${user.email}` : ""}
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
            onClick={onClose}
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
  );
}
