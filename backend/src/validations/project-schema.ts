import { z } from "zod";
import { PROJECT_ROLES } from "../types/role";

export const ProjectSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(30, { message: "Name must be at most 30 characters long" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters long" })
    .max(1000, { message: "Description must be at most 1000 characters long" }),
});

export const updateProjectSchema = ProjectSchema.partial();

export const addProjectMemberSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
      message: "Invalid email",
    }),
  role: z.enum([PROJECT_ROLES.lead, PROJECT_ROLES.manager, PROJECT_ROLES.member]),
});

export const updateMemberRoleSchema = addProjectMemberSchema.pick({ role: true });
