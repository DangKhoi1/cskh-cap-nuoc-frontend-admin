import { apiRequest } from "@/lib/api-client";
import type { PermissionItem } from "@/types";

export const permissionsApi = {
  list(module?: string) {
    const query =
      module && module.trim().length > 0
        ? `?module=${encodeURIComponent(module.trim())}`
        : "";
    return apiRequest<PermissionItem[]>(`/admin/get-permissions${query}`);
  },
};
