import { create } from "zustand";
import { registerApiAuthHandlers } from "@/lib/api-client";
import { authApi } from "@/services/api/auth.api";
import type { AdminAccessProfile } from "@/types";
import { useAlertStore } from "./alert.store";

interface AuthState {
  currentUser: AdminAccessProfile | null;
  isInitialized: boolean;
  isLoading: boolean;
  initSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<AdminAccessProfile>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  clearAuth: () => void;
  hasPermission: (permissionCode?: string) => boolean;
  isSystemAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isInitialized: false,
  isLoading: false,

  initSession: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const profile = await authApi.getMe(true);
      set({ currentUser: profile, isInitialized: true, isLoading: false });
    } catch {
      set({ currentUser: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await authApi.staffLogin(email, password);
      const profile = await authApi.getMe(true);
      set({ currentUser: profile, isInitialized: true, isLoading: false });
      return profile;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear client state even if session already expired
    } finally {
      set({ currentUser: null, isInitialized: true });
    }
  },

  refreshMe: async () => {
    try {
      const profile = await authApi.getMe(true);
      set({ currentUser: profile, isInitialized: true });
    } catch {
      set({ currentUser: null, isInitialized: true });
    }
  },

  clearAuth: () => {
    set({ currentUser: null, isInitialized: true });
  },

  hasPermission: (permissionCode?: string) => {
    if (!permissionCode) return true;
    const user = get().currentUser;
    if (!user || !user.active) return false;
    return user.permissionCodes.includes(permissionCode);
  },

  isSystemAdmin: () => {
    const user = get().currentUser;
    return Boolean(user && user.active && user.role === "ADMIN");
  },
}));

registerApiAuthHandlers({
  onUnauthorized: () => {
    useAuthStore.getState().clearAuth();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.replace("/login");
    }
  },
  onForbidden: (message) => {
    useAlertStore
      .getState()
      .showErrorAlert(
        message || "Bạn không có quyền thực hiện thao tác này."
      );
    void useAuthStore.getState().refreshMe();
  },
});
