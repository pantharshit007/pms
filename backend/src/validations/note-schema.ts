import { z } from "zod";

export const NoteSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long" })
    .max(30, { message: "Title must be at most 30 characters long" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters long" })
    .max(500, { message: "Description must be at most 500 characters long" }),
});

export const updateNoteSchema = NoteSchema.partial().refine(
  (data) => data.title || data.description,
  {
    message: "At least one field must be provided to update the note.",
    path: [],
  }
);
