import { z } from "zod";

export const RegisterSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
      message: "Invalid email",
    }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
  username: z.string().min(4, { message: "Username must be at least 4 characters long" }),
  password: z
    .string({ invalid_type_error: "Invalid password" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string({ invalid_type_error: "Invalid password" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});
