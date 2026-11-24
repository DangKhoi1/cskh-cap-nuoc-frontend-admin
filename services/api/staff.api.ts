import { apiRequest } from "@/lib/api-client";
import type { PaginatedResponse, StaffUser } from "@/types";

export interface ListStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  active?: boolean;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  department?: string;
}

export interface UpdateStaffPayload {
  fullName?: string;
  department?: string;
}

export const staffApi = {
  list(params: ListStaffParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search?.trim()) searchParams.set("search", params.search.trim());
    if (params.roleId) searchParams.set("roleId", params.roleId);
    if (params.active !== undefined) {
      searchParams.set("active", String(params.active));
    }
    const qs = searchParams.toString();
    return apiRequest<PaginatedResponse<StaffUser>>(
      `/admin/staff${qs ? `?${qs}` : ""}`
    );
  },

  create(payload: CreateStaffPayload) {
    return apiRequest<StaffUser>("/admin/staff", {
      method: "POST",
      body: payload,
    });
  },

  updateProfile(id: string, payload: UpdateStaffPayload) {
    return apiRequest<StaffUser>(`/admin/staff/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  assignRole(id: string, roleId: string) {
    return apiRequest<StaffUser>(`/admin/staff/${id}/role`, {
      method: "PATCH",
      body: { roleId },
    });
  },

  setStatus(id: string, active: boolean) {
    return apiRequest<StaffUser>(`/admin/staff/${id}/status`, {
      method: "PATCH",
      body: { active },
    });
  },

  remove(id: string) {
    return apiRequest<{ EC: number; EM: string }>(`/admin/staff/${id}`, {
      method: "DELETE",
    });
  },
};
