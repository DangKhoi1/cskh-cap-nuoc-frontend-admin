"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MOCK_PERMISSIONS,
  MOCK_ROLES,
  MOCK_STAFF,
} from "@/services/mock-data";
import type { PermissionItem, RoleDefinition, StaffUser } from "@/types";

export interface SuccessAlertItem {
  id: string;
  message: string;
}

interface AdminStoreValue {
  roles: RoleDefinition[];
  setRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
  staff: StaffUser[];
  setStaff: React.Dispatch<React.SetStateAction<StaffUser[]>>;
  permissions: PermissionItem[];
  currentUserId: string;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string>>;
  currentUser: StaffUser | null;
  currentRole: RoleDefinition | null;
  currentPermissionCodes: string[];
  hasPermission: (permissionCode?: string) => boolean;
  alerts: SuccessAlertItem[];
  showSuccessAlert: (message: string) => void;
  dismissAlert: (id: string) => void;
}

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roles, setRoles] = useState<RoleDefinition[]>(MOCK_ROLES);
  const [staff, setStaff] = useState<StaffUser[]>(MOCK_STAFF);
  const [currentUserId, setCurrentUserId] = useState<string>(
    MOCK_STAFF[0]?.id ?? ""
  );
  const [alerts, setAlerts] = useState<SuccessAlertItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissAlert = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showSuccessAlert = useCallback(
    (message: string) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setAlerts((prev) => [...prev.slice(-2), { id, message }]);
      const timer = window.setTimeout(() => {
        dismissAlert(id);
      }, 3500);
      timersRef.current.set(id, timer);
    },
    [dismissAlert]
  );

  const currentUser = useMemo(
    () => staff.find((u) => u.id === currentUserId) ?? staff[0] ?? null,
    [staff, currentUserId]
  );

  const currentRole = useMemo(() => {
    if (!currentUser) return null;
    return roles.find((r) => r.code === currentUser.role) ?? null;
  }, [roles, currentUser]);

  const currentPermissionCodes = useMemo(
    () => (currentUser?.active ? (currentRole?.permissionCodes ?? []) : []),
    [currentUser, currentRole]
  );

  const hasPermission = useMemo(() => {
    const codeSet = new Set(currentPermissionCodes);
    return (permissionCode?: string) => {
      if (!permissionCode) return true;
      return codeSet.has(permissionCode);
    };
  }, [currentPermissionCodes]);

  return (
    <AdminStoreContext.Provider
      value={{
        roles,
        setRoles,
        staff,
        setStaff,
        permissions: MOCK_PERMISSIONS,
        currentUserId,
        setCurrentUserId,
        currentUser,
        currentRole,
        currentPermissionCodes,
        hasPermission,
        alerts,
        showSuccessAlert,
        dismissAlert,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used inside AdminStoreProvider");
  }
  return ctx;
}
