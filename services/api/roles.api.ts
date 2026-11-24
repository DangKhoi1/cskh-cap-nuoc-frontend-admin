import { apiRequest } from "@/lib/api-client";
import type { RoleDefinition } from "@/types";

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionCodes?: string[];
}

export const rolesApi = {
  list() {
    return apiRequest<RoleDefinition[]>("/admin/roles");
  },

  create(payload: CreateRolePayload) {
    return apiRequest<RoleDefinition>("/admin/roles", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: UpdateRolePayload) {
    return apiRequest<RoleDefinition>(`/admin/roles/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<{ EC: number; EM: string }>(`/admin/roles/${id}`, {
      method: "DELETE",
    });
  },
};
