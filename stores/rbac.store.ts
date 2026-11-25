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

type SetRbacState = (
  partial:
    | Partial<RbacState>
    | ((state: RbacState) => Partial<RbacState>)
) => void;

async function runWithFlag<T>(
  set: SetRbacState,
  flag: "loadingPermissions" | "loadingRoles" | "loadingStaff" | "isSubmitting",
  action: () => Promise<T>
): Promise<T> {
  set({ [flag]: true });
  try {
    return await action();
  } finally {
    set({ [flag]: false });
  }
}

export const useRbacStore = create<RbacState>((set, get) => ({
  permissions: [],
  roles: [],
  staffPage: EMPTY_STAFF_PAGE,
  staffQuery: { page: 1, limit: 10 },
  loadingPermissions: false,
  loadingRoles: false,
  loadingStaff: false,
  isSubmitting: false,

  fetchPermissions: (module) =>
    runWithFlag(set, "loadingPermissions", async () => {
      const permissions = await permissionsApi.list(module);
      set({ permissions });
    }),

  fetchRoles: () =>
    runWithFlag(set, "loadingRoles", async () => {
      const roles = await rolesApi.list();
      set({ roles });
    }),

  createRole: (payload) =>
    runWithFlag(set, "isSubmitting", async () => {
      const created = await rolesApi.create(payload);
      set((state) => ({ roles: [...state.roles, created] }));
      return created;
    }),

  updateRole: (id, payload) =>
    runWithFlag(set, "isSubmitting", async () => {
      const updated = await rolesApi.update(id, payload);
      set((state) => ({
        roles: state.roles.map((r) => (r.id === id ? updated : r)),
      }));
      if (useAuthStore.getState().currentUser?.roleId === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    }),

  deleteRole: (id) =>
    runWithFlag(set, "isSubmitting", async () => {
      await rolesApi.remove(id);
      set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }));
    }),

  fetchStaff: (params) => {
    const mergedQuery: ListStaffParams = {
      ...get().staffQuery,
      ...params,
    };
    set({ staffQuery: mergedQuery });
    return runWithFlag(set, "loadingStaff", async () => {
      const staffPage = await staffApi.list(mergedQuery);
      set({ staffPage });
    });
  },

  createStaff: (payload) =>
    runWithFlag(set, "isSubmitting", async () => {
      const created = await staffApi.create(payload);
      await get().fetchStaff({ page: 1 });
      return created;
    }),

  updateStaff: (id, payload) =>
    runWithFlag(set, "isSubmitting", async () => {
      const updated = await staffApi.updateProfile(id, payload);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
      }));
      if (useAuthStore.getState().currentUser?.id === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    }),

  assignStaffRole: (id, roleId) =>
    runWithFlag(set, "isSubmitting", async () => {
      const updated = await staffApi.assignRole(id, roleId);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
      }));
      if (useAuthStore.getState().currentUser?.id === id) {
        await useAuthStore.getState().refreshMe();
      }
      return updated;
    }),

  setStaffStatus: (id, active) =>
    runWithFlag(set, "isSubmitting", async () => {
      const updated = await staffApi.setStatus(id, active);
      set((state) => ({
        staffPage: {
          ...state.staffPage,
          items: state.staffPage.items.map((u) => (u.id === id ? updated : u)),
        },
      }));
      return updated;
    }),

  deleteStaff: (id) =>
    runWithFlag(set, "isSubmitting", async () => {
      await staffApi.remove(id);
      await get().fetchStaff();
    }),

  resetRbac: () => {
    set({
      permissions: [],
      roles: [],
      staffPage: EMPTY_STAFF_PAGE,
      staffQuery: { page: 1, limit: 10 },
    });
  },
}));
