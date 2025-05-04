import { z } from "zod";
import { TASK_STATUS } from "../utils/constant";

export const TaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 3 characters long" })
    .max(30, { message: "Title must be at most 30 characters long" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 3 characters long" })
    .max(1000, { message: "Description must be at most 1000 characters long" }),
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
      message: "Invalid email",
    }),
});

export const updateTaskSchema = TaskSchema.partial()
  .extend({
    status: z
      .enum([
        TASK_STATUS.planning,
        TASK_STATUS.in_progress,
        TASK_STATUS.completed,
        TASK_STATUS.cancelled,
      ])
      .optional(),
  })
  .refine((data) => data.title || data.description || data.email || data.status, {
    message: "At least one field must be provided to update the task.",
    path: [],
  });

export const updateTaskStatusSchema = z.object({
  status: z.enum([
    TASK_STATUS.planning,
    TASK_STATUS.in_progress,
    TASK_STATUS.completed,
    TASK_STATUS.cancelled,
  ]),
});
