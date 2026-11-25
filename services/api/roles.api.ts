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
    return apiRequest<RoleDefinition[]>("/admin/get-roles");
  },

  create(payload: CreateRolePayload) {
    return apiRequest<RoleDefinition>("/admin/create-role", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: UpdateRolePayload) {
    return apiRequest<RoleDefinition>(`/admin/update-role/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<{ EC: number; EM: string }>(`/admin/delete-role/${id}`, {
      method: "DELETE",
    });
  },
};
