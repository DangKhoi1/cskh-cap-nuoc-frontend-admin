"use client";

import { useState } from "react";
import { Check, ChevronRight, Lock, Minus, Search } from "lucide-react";
import type { PermissionItem } from "@/types";

interface PermissionSelectorProps {
  groupedPermissions: Array<[string, PermissionItem[]]>;
  selectedCodes: string[];
  lockedAll?: boolean;
  onTogglePermission: (code: string) => void;
  onToggleModule: (codes: string[], enable: boolean) => void;
}

export function PermissionSelector({
  groupedPermissions,
  selectedCodes,
  lockedAll = false,
  onTogglePermission,
  onToggleModule,
}: PermissionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groupedPermissions.forEach(([modName], idx) => {
      initial[modName] = idx < 3;
    });
    return initial;
  });

  const toggleModuleOpen = (moduleName: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleGroups = groupedPermissions
    .map(([moduleName, items]) => {
      const filteredItems = items.filter((p) => {
        if (onlySelected && !selectedCodes.includes(p.code)) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          moduleName.toLowerCase().includes(q)
        );
      });
      return { moduleName, allItems: items, filteredItems };
    })
    .filter((group) => group.filteredItems.length > 0);

  return (
    <div className="space-y-3">
      {lockedAll ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary-tint/50 px-3.5 py-2.5 text-xs font-medium text-primary-tint-ink">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Vai trò ADMIN mặc định có toàn quyền hệ thống và không thể chỉnh sửa
            danh sách quyền.
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm quyền theo tên..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="tabular-nums text-xs font-medium text-foreground-muted">
            Đã chọn {selectedCodes.length} quyền
          </span>
          <label className="flex cursor-pointer items-center gap-2 select-none rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover">
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              <input
                type="checkbox"
                checked={onlySelected}
                onChange={(e) => setOnlySelected(e.target.checked)}
                className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-border-strong bg-surface checked:border-primary checked:bg-primary"
              />
              <Check className="pointer-events-none absolute h-2.5 w-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100" />
            </span>
            <span>Chỉ xem quyền đã chọn</span>
          </label>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {onlySelected
              ? "Chưa có quyền nào được chọn khớp với bộ lọc hiện tại."
              : `Không tìm thấy quyền nào khớp với "${searchQuery}".`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setOnlySelected(false);
            }}
            className="mt-3 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleGroups.map(({ moduleName, allItems, filteredItems }) => {
            const selectableCodes = lockedAll
              ? []
              : allItems.filter((p) => !p.adminOnly).map((p) => p.code);
            const allCodes = allItems.map((p) => p.code);
            const selectedCount = allCodes.filter((c) =>
              selectedCodes.includes(c)
            ).length;
            const isAllSelectableChecked =
              selectableCodes.length > 0 &&
              selectableCodes.every((c) => selectedCodes.includes(c));
            const isSomeSelectableChecked =
              selectableCodes.some((c) => selectedCodes.includes(c)) &&
              !isAllSelectableChecked;
            const isOpen =
              q || onlySelected ? true : (openModules[moduleName] ?? true);

            return (
              <div
                key={moduleName}
                className="overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-150"
              >
                <div className="flex items-center justify-between gap-3 bg-surface-subtle px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleModuleOpen(moduleName)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-start gap-2 text-left sm:items-center"
                  >
                    <ChevronRight
                      className={`mt-0.5 h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:mt-0 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="break-words text-sm font-semibold text-foreground">
                        {moduleName}
                      </span>
                      <span className="tabular-nums text-xs text-foreground-muted">
                        ({selectedCount}/{allItems.length})
                      </span>
                    </span>
                  </button>

                  {!lockedAll && selectableCodes.length > 0 ? (
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 select-none">
                      <span className="text-xs font-medium text-foreground-muted">
                        Chọn cả nhóm
                      </span>
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelectableChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelectableChecked;
                          }}
                          onChange={() =>
                            onToggleModule(
                              selectableCodes,
                              !isAllSelectableChecked
                            )
                          }
                          aria-label={`Chọn cả nhóm ${moduleName}`}
                          className={`h-4 w-4 cursor-pointer appearance-none rounded border transition-colors duration-150 ${
                            isAllSelectableChecked
                              ? "border-primary bg-primary"
                              : isSomeSelectableChecked
                                ? "border-primary bg-primary/15"
                                : "border-border-strong bg-surface"
                          }`}
                        />
                        <Check
                          className={`pointer-events-none absolute h-3 w-3 text-primary-foreground transition-all duration-150 ${
                            isAllSelectableChecked
                              ? "scale-100 opacity-100"
                              : "scale-75 opacity-0"
                          }`}
                        />
                        <Minus
                          className={`pointer-events-none absolute h-3 w-3 text-primary transition-all duration-150 ${
                            isSomeSelectableChecked
                              ? "scale-100 opacity-100"
                              : "scale-75 opacity-0"
                          }`}
                        />
                      </span>
                    </label>
                  ) : null}
                </div>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 gap-1 bg-surface p-2 sm:grid-cols-2">
                      {filteredItems.map((perm) => {
                        const isActive = selectedCodes.includes(perm.code);
                        const isDisabled = lockedAll || perm.adminOnly;
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 ${
                              isDisabled
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer"
                            } ${
                              isActive
                                ? "bg-primary-tint/45"
                                : isDisabled
                                  ? ""
                                  : "hover:bg-surface-hover"
                            }`}
                          >
                            <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isActive}
                                disabled={isDisabled}
                                onChange={() => onTogglePermission(perm.code)}
                                className="peer h-4 w-4 appearance-none rounded border border-border-strong bg-surface transition-colors duration-150 checked:border-primary checked:bg-primary disabled:cursor-not-allowed"
                              />
                              <Check className="pointer-events-none absolute h-3 w-3 scale-75 text-primary-foreground opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                                <span>{perm.name}</span>
                                {perm.adminOnly && !lockedAll ? (
                                  <span className="rounded bg-warning-tint px-1.5 py-0.5 text-[10px] font-medium text-warning-tint-ink">
                                    Chỉ dành cho quản trị viên hệ thống
                                  </span>
                                ) : null}
                              </span>
                              <span className="block text-xs text-foreground-subtle">
                                {perm.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
