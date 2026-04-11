export type EmployeeRole = "employee" | "manager";

export type AccessRole = EmployeeRole | "owner";

export type Employee = {
  id?: number;
  businessId: string;
  memberUserId: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  role: EmployeeRole;
  status: string;
  createdAt?: string;
};

export type InviteEmployeeInput = {
  displayName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
};

export type UserAccessContext = {
  userId: string;
  businessId: string;
  role: AccessRole;
  accountType: "owner" | "member";
  memberStatus: string | null;
};
