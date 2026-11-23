"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Droplets,
  KeyRound,
  Lock,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { AdminStoreProvider, useAdminStore } from "@/services/AdminStoreContext";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Quản lý người dùng" | "Phân quyền";
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "customers",
    href: "/customers",
    label: "Khách hàng",
    icon: Users,
    group: "Quản lý người dùng",
    permission: "customers.view",
  },
  {
    id: "users",
    href: "/users",
    label: "Nhân viên",
    icon: UserCog,
    group: "Quản lý người dùng",
    permission: "users.view",
  },
  {
    id: "roles",
    href: "/roles",
    label: "Vai trò",
    icon: ShieldCheck,
    group: "Phân quyền",
    permission: "roles.view",
  },
  {
    id: "permissions",
    href: "/permissions",
    label: "Danh mục quyền",
    icon: KeyRound,
    group: "Phân quyền",
    permission: "permissions.view",
  },
];

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "NV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    staff,
    roles,
    currentUser,
    setCurrentUserId,
    hasPermission,
    alerts,
    dismissAlert,
  } = useAdminStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("cskh-admin-theme");
    const initial = saved === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = initial;
    if (initial !== "light") {
      const id = window.requestAnimationFrame(() => setTheme(initial));
      return () => window.cancelAnimationFrame(id);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("cskh-admin-theme", next);
  };

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => hasPermission(item.permission)),
    [hasPermission]
  );

  const matchedNav = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  const isAuthorized = matchedNav
    ? hasPermission(matchedNav.permission)
    : true;

  const currentNav =
    visibleNavItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    ) ??
    matchedNav ??
    NAV_ITEMS[0];

  const renderNavLinks = (onNavigate?: () => void) => {
    const groups: Array<"Quản lý người dùng" | "Phân quyền"> = [
      "Quản lý người dùng",
      "Phân quyền",
    ];
    return (
      <nav
        aria-label="Điều hướng chính"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
      >
        {groups.map((group) => {
          const groupItems = visibleNavItems.filter(
            (item) => item.group === group
          );
          if (groupItems.length === 0) return null;

          return (
            <div key={group}>
              <p className="px-3 pb-1.5 text-xs font-medium text-foreground-subtle">
                {group}
              </p>
              <ul className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                          active
                            ? "bg-primary-tint text-primary-tint-ink"
                            : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    );
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Droplets className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Chăm sóc khách hàng
            </p>
            <p className="truncate text-xs text-foreground-subtle">
              Cấp nước · Quản trị
            </p>
          </div>
        </div>
        {renderNavLinks()}
      </aside>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileNavOpen(false)}
            className="animate-fade-in fixed inset-0 bg-slate-950/40"
          />
          <aside className="relative z-10 flex w-72 flex-col border-r border-border bg-surface">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Droplets className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Chăm sóc khách hàng
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Đóng điều hướng"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderNavLinks(() => setMobileNavOpen(false))}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mở menu điều hướng"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="truncate text-base font-semibold text-foreground">
              {currentNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Chuyển sang giao diện tối"
                  : "Chuyển sang giao diện sáng"
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            <div className="relative hidden items-center sm:flex">
              <div className="pointer-events-none absolute left-2 flex h-6 w-6 items-center justify-center rounded-md bg-primary-tint text-[11px] font-semibold text-primary-tint-ink">
                {getInitials(currentUser?.fullName ?? "MK")}
              </div>
              <select
                aria-label="Chuyển người dùng đăng nhập"
                value={currentUser?.id ?? ""}
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-border bg-surface pl-10 pr-8 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover focus:border-primary focus:outline-none"
              >
                {staff.map((user) => {
                  const roleName =
                    roles.find((r) => r.code === user.role)?.name ?? user.role;
                  return (
                    <option
                      key={user.id}
                      value={user.id}
                      disabled={!user.active}
                    >
                      {user.fullName} ({roleName})
                      {user.active ? "" : " - Đã khóa"}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle" />
            </div>

            <Link
              href="/login"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">Đăng xuất</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
          {isAuthorized ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-subtle text-foreground-muted">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                Bạn không có quyền truy cập trang này
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-foreground-muted">
                {!currentUser?.active
                  ? "Tài khoản hiện tại đang bị tạm khóa nên không có quyền truy cập các chức năng quản trị."
                  : "Vai trò hiện tại không được cấp quyền xem mục này. Vui lòng chuyển sang trang được phép hoặc chọn tài khoản khác."}
              </p>
              {visibleNavItems.length > 0 ? (
                <Link
                  href={visibleNavItems[0].href}
                  className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
                >
                  Chuyển tới {visibleNavItems[0].label}
                </Link>
              ) : null}
            </div>
          )}
        </main>
      </div>

      {alerts.length > 0 ? (
        <div
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-16 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6"
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              role="status"
              className="animate-panel-in pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-surface px-4 py-3 shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                <p className="text-sm font-medium text-foreground">
                  {alert.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                aria-label="Đóng thông báo"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </AdminStoreProvider>
  );
}
