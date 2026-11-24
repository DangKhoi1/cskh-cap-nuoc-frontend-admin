import { create } from "zustand";
import {
  rolesApi,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "@/services/api/roles.api";
import { permissionsApi } from "@/services/api/permissions.api";
import {
  staffApi,
  type CreateStaffPayload,
  type ListStaffParams,
  type UpdateStaffPayload,
} from "@/services/api/staff.api";
import type {
  PaginatedResponse,
  PermissionItem,
  RoleDefinition,
  StaffUser,
} from "@/types";
import { useAuthStore } from "./auth.store";

interface RbacState {
  permissions: PermissionItem[];
  roles: RoleDefinition[];
  staffPage: PaginatedResponse<StaffUser>;
  staffQuery: ListStaffParams;
  loadingPermissions: boolean;
  loadingRoles: boolean;
  loadingStaff: boolean;
  isSubmitting: boolean;

  fetchPermissions: (module?: string) => Promise<void>;
  fetchRoles: () => Promise<void>;
  createRole: (payload: CreateRolePayload) => Promise<RoleDefinition>;
  updateRole: (id: string, payload: UpdateRolePayload) => Promise<RoleDefinition>;
  deleteRole: (id: string) => Promise<void>;

  fetchStaff: (params?: ListStaffParams) => Promise<void>;
  createStaff: (payload: CreateStaffPayload) => Promise<StaffUser>;
  updateStaff: (id: string, payload: UpdateStaffPayload) => Promise<StaffUser>;
  assignStaffRole: (id: string, roleId: string) => Promise<StaffUser>;
  setStaffStatus: (id: string, active: boolean) => Promise<StaffUser>;
  deleteStaff: (id: string) => Promise<void>;
  resetRbac: () => void;
}

const EMPTY_STAFF_PAGE: PaginatedResponse<StaffUser> = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const useRbacStore = create<RbacState>((set, get) => ({
  permissions: [],
  roles: [],
  staffPage: EMPTY_STAFF_PAGE,
  staffQuery: { page: 1, limit: 10 },
  loadingPermissions: false,
  loadingRoles: false,
  loadingStaff: false,
  isSubmitting: false,

  fetchPermissions: async (module) => {
    set({ loadingPermissions: true });
    try {
      const permissions = await permissionsApi.list(module);
      set({ permissions, loadingPermissions: false });
    } catch (error) {
      set({ loadingPermissions: false });
      throw error;
    }
  },

  fetchRoles: async () => {
    set({ loadingRoles: true });
    try {
      const roles = await rolesApi.list();
      set({ roles, loadingRoles: false });
    } catch (error) {
      set({ loadingRoles: false });
      throw error;
    }
  },

  createRole: async (payload) => {
    set({ isSubmitting: true });
    try {
      const created = await rolesApi.create(payload);
      set((state) => ({
        roles: [...state.roles, created],
        isSubmitting: false,
      }));
      return created;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  updateRole: async (id, payload) => {
    set({ isSubmitting: true });
    try {
      const updated = await rolesApi.update(id, payload);
      set((state) => ({
        roles: state.roles.map((r) => (r.id === id ? updated : r)),
        isSubmitting: false,
      }));
      if (useAuthStore.getState().currentUser?.roleId === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  deleteRole: async (id) => {
    set({ isSubmitting: true });
    try {
      await rolesApi.remove(id);
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        isSubmitting: false,
      }));
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  fetchStaff: async (params) => {
    const mergedQuery: ListStaffParams = {
      ...get().staffQuery,
      ...params,
    };
    set({ loadingStaff: true, staffQuery: mergedQuery });
    try {
      const staffPage = await staffApi.list(mergedQuery);
      set({ staffPage, loadingStaff: false });
    } catch (error) {
      set({ loadingStaff: false });
      throw error;
    }
  },

  createStaff: async (payload) => {
    set({ isSubmitting: true });
    try {
      const created = await staffApi.create(payload);
      await get().fetchStaff({ page: 1 });
      set({ isSubmitting: false });
      return created;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  updateStaff: async (id, payload) => {
    set({ isSubmitting: true });
    try {
      const updated = await staffApi.updateProfile(id, payload);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
        isSubmitting: false,
      }));
      if (useAuthStore.getState().currentUser?.id === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  assignStaffRole: async (id, roleId) => {
    set({ isSubmitting: true });
    try {
      const updated = await staffApi.assignRole(id, roleId);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
        isSubmitting: false,
      }));
      if (useAuthStore.getState().currentUser?.id === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  setStaffStatus: async (id, active) => {
    set({ isSubmitting: true });
    try {
      const updated = await staffApi.setStatus(id, active);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
        isSubmitting: false,
      }));
      return updated;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  deleteStaff: async (id) => {
    set({ isSubmitting: true });
    try {
      await staffApi.remove(id);
      await get().fetchStaff();
      set({ isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  resetRbac: () => {
    set({
      permissions: [],
      roles: [],
      staffPage: EMPTY_STAFF_PAGE,
      staffQuery: { page: 1, limit: 10 },
    });
  },
}));
