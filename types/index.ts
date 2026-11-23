export interface CustomerLinkItem {
  id: string;
  userId: string;
  customerCode: string;
  customerName: string;
  phoneNumber: string;
  serviceAddress: string;
  meterNumber: string | null;
  createdAt: string;
  updatedAt: string;
  unpaidCount: number;
  unpaidTotal: number;
}

export type StaffRole = "ADMIN" | "CSKH" | "SUPPORT" | (string & {});

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCodes: string[];
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  department: string;
  active: boolean;
  lastLoginAt: string;
}
