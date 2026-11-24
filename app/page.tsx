"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/AdminShell";
import { useAuthStore } from "@/stores/auth.store";

export default function HomePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const firstAllowed = NAV_ITEMS.find(
    (item) =>
      !item.permission ||
      Boolean(currentUser?.permissionCodes.includes(item.permission))
  );

  useEffect(() => {
    if (isInitialized && currentUser && firstAllowed) {
      router.replace(firstAllowed.href);
    }
  }, [isInitialized, currentUser, firstAllowed, router]);

  if (isInitialized && currentUser && !firstAllowed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-subtle text-foreground-muted">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          Tài khoản chưa được cấp quyền truy cập
        </h2>
        <p className="mt-1.5 max-w-md text-sm text-foreground-muted">
          Vui lòng liên hệ quản trị viên hệ thống để được phân quyền chức năng.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 text-sm text-foreground-muted">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
      <span>Đang chuyển hướng...</span>
    </div>
  );
}
