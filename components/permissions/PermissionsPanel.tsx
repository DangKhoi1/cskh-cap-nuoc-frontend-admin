"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, KeyRound, Search } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useAlertStore } from "@/stores/alert.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRbacStore } from "@/stores/rbac.store";

export function PermissionsPanel() {
  const currentUserId = useAuthStore((s) => s.currentUser?.id);
  const permissions = useRbacStore((s) => s.permissions);
  const loadingPermissions = useRbacStore((s) => s.loadingPermissions);
  const fetchPermissions = useRbacStore((s) => s.fetchPermissions);
  const showErrorAlert = useAlertStore((s) => s.showErrorAlert);

  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Tất cả");

  useEffect(() => {
    if (!currentUserId) return;
    fetchPermissions().catch((error) => {
      if (error instanceof ApiError && error.status !== 401 && error.status !== 403) {
        showErrorAlert(error.message);
      }
    });
  }, [currentUserId, fetchPermissions, showErrorAlert]);

  const modules = useMemo(
    () => [
      "Tất cả",
      ...Array.from(new Set(permissions.map((p) => p.module))),
    ],
    [permissions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permissions.filter((perm) => {
      if (moduleFilter !== "Tất cả" && perm.module !== moduleFilter)
        return false;
      if (!q) return true;
      return (
        perm.name.toLowerCase().includes(q) ||
        perm.description.toLowerCase().includes(q) ||
        perm.module.toLowerCase().includes(q)
      );
    });
  }, [permissions, query, moduleFilter]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        Danh mục quyền được định nghĩa sẵn trong hệ thống. Để gán quyền cho từng
        nhóm người dùng, vào mục{" "}
        <Link href="/roles" className="font-medium text-primary hover:underline">
          Vai trò
        </Link>
        .
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên quyền, mô tả..."
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <select
              aria-label="Lọc theo phân hệ"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none"
            >
              {modules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod === "Tất cả" ? "Tất cả phân hệ" : mod}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          </div>
        </div>

        <p className="shrink-0 whitespace-nowrap tabular-nums text-sm text-foreground-muted">
          {filtered.length} / {permissions.length} quyền
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loadingPermissions && permissions.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-foreground-muted">
            Đang tải danh mục quyền...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <KeyRound className="h-8 w-8 text-foreground-subtle" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Không tìm thấy quyền phù hợp
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setModuleFilter("Tất cả");
              }}
              className="mt-4 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-medium text-foreground-muted">
                <tr>
                  <th className="px-5 py-3">Tên quyền</th>
                  <th className="px-4 py-3">Phân hệ</th>
                  <th className="px-5 py-3">Mô tả chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((perm) => (
                  <tr
                    key={perm.id}
                    className="transition-colors duration-150 hover:bg-surface-hover"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{perm.name}</span>
                        {perm.adminOnly ? (
                          <span className="rounded-md bg-warning-tint px-2 py-0.5 text-[11px] font-medium text-warning-tint-ink">
                            Chỉ ADMIN hệ thống
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">
                      {perm.module}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {perm.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
