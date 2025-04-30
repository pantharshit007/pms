import { z } from "zod";

export const OtpSchema = z.object({
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
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" }),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
      message: "Invalid email",
    }),
  otp: z.string().regex(/^[0-9]{6}$/, { message: "Invalid OTP" }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
      message: "Invalid email",
    }),
  password: z
    .string({ invalid_type_error: "Invalid password" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" }),
});
