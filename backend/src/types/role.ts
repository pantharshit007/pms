export const ACCOUNT_ROLES = {
  admin: "ADMIN",
  user: "USER",
  pro: "PRO",
} as const;

export const AccountRole = Object.values(ACCOUNT_ROLES);
export type AccountType = (typeof ACCOUNT_ROLES)[keyof typeof ACCOUNT_ROLES];

export const PROJECT_ROLES = {
  admin: "ADMIN",
  project_manager: "PROJECT_MANAGER",
  member: "MEMBER",
} as const;

export const ProjectRole = Object.values(PROJECT_ROLES);
export type ProjectRoleType = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES];
