"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/services/AdminStoreContext";
import {
  Check,
  Droplets,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { staff, setCurrentUserId } = useAdminStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const fillDemoAccount = () => {
    setEmail("admin@capnuoc.vn");
    setPassword("123456");
    setFieldErrors({});
    setFormError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: { email?: string; password?: string } = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = "Vui lòng nhập email công vụ.";
    } else if (!cleanEmail.includes("@")) {
      errors.email = "Email chưa đúng định dạng.";
    }

    if (!password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    const matchedUser = staff.find(
      (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (matchedUser) {
      setCurrentUserId(matchedUser.id);
    }
    window.setTimeout(() => {
      setIsSubmitting(false);
      router.push("/");
    }, 350);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <main className="mx-auto w-full max-w-md py-6">
        <div className="animate-panel-in rounded-xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Droplets className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-lg font-semibold text-foreground">
              Chăm sóc khách hàng Cấp nước
            </h1>
            <p className="mt-0.5 text-xs text-foreground-subtle">
              Đăng nhập cổng quản trị hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {formError ? (
              <div className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-xs font-medium text-danger-tint-ink">
                {formError}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-foreground-muted"
              >
                Email <span className="text-danger">*</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="ten.nhanvien@capnuoc.vn"
                  className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-150 focus:outline-none ${fieldErrors.email
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-primary"
                    }`}
                />
              </div>
              {fieldErrors.email ? (
                <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-foreground-muted"
              >
                Mật khẩu <span className="text-danger">*</span>
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="Nhập mật khẩu"
                  className={`h-10 w-full rounded-lg border bg-background pl-9 pr-10 text-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-150 focus:outline-none ${fieldErrors.password
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-primary"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-foreground-subtle transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-danger">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border-strong bg-surface transition-colors duration-150 checked:border-primary checked:bg-primary"
                  />
                  <Check className="pointer-events-none absolute h-3 w-3 scale-75 text-primary-foreground opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100" />
                </span>
                <span className="text-xs text-foreground-muted">
                  Ghi nhớ phiên đăng nhập
                </span>
              </label>

              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs font-medium text-primary hover:underline"
              >
                Điền tài khoản mẫu
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-surface-subtle px-3.5 py-2.5 text-xs text-foreground-muted">
            <p className="font-medium text-foreground">Tài khoản quản trị (Demo)</p>
            <p className="mt-0.5 font-mono text-[11px]">
              admin@capnuoc.vn · 123456
            </p>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md text-center text-xs text-foreground-subtle">
        Hệ thống quản trị Chăm sóc khách hàng Cấp nước
      </footer>
    </div>
  );
}

