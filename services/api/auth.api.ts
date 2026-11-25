import { apiRequest } from "@/lib/api-client";
import type { AdminAccessProfile } from "@/types";

export interface StaffLoginResponse {
  EC: number;
  EM: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    roleId: string | null;
  };
}

export const authApi = {
  staffLogin(email: string, password: string) {
    return apiRequest<StaffLoginResponse>("/auth/staff/login", {
      method: "POST",
      body: { email, password },
      skipAuthHandlers: true,
    });
  },

  logout() {
    return apiRequest<{ EC: number; EM: string }>("/auth/staff/logout", {
      method: "POST",
      skipAuthHandlers: true,
    });
  },

  getMe(skipAuthHandlers = false) {
    return apiRequest<AdminAccessProfile>("/admin/me", {
      method: "GET",
      skipAuthHandlers,
    });
  },
};
