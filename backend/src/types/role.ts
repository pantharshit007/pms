const ACCOUNT_TYPES = {
  admin: "ADMIN",
  user: "USER",
  pro: "PRO",
} as const;

export { ACCOUNT_TYPES };
export type RolesType = keyof typeof ACCOUNT_TYPES;
