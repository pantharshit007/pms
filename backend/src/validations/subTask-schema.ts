import { z } from "zod";

export const createSubTaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 3 characters long" })
    .max(30, { message: "Title must be at most 30 characters long" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 3 characters long" })
    .max(1000, { message: "Description must be at most 1000 characters long" }),
});

export const updateSubTaskSchema = createSubTaskSchema
  .partial()
  .extend({
    isComplete: z.boolean(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "At least one field must be updated",
  });
