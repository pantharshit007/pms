import { Request, Response } from "express";
import { apiResponse } from "../utils/api-response";
import { RegisterSchema } from "../types/auth-schema";
import { CustomError } from "../utils/custom-error";
import { User } from "../models/user.model";
import { generateOtp } from "../utils/otp-generate";
import { encrypt } from "../utils/crypt";
import { otpExpiry } from "../utils/constant";
import { Otp } from "../models/otp.model";

async function sendOTP(req: Request, res: Response) {
  try {
    const parsedBody = RegisterSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(400, parsedBody.error.errors.map((err) => err.message).join(", "));
    }

    const { email, fullName, username, password } = parsedBody.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new CustomError(400, "Email already exists");
      } else {
        throw new CustomError(400, "Username already exists");
      }
    }

    const otp = generateOtp();

    const stringifiedData = JSON.stringify({ email, fullName, username, password });
    const encryptedData = encrypt(stringifiedData);

    const expiresAt = new Date(Date.now() + otpExpiry);

    const otpDoc = await Otp.updateOne(
      {
        email,
        otp,
        data: encryptedData,
        expiresAt,
      },
      { upsert: true }
    );

    if (!otpDoc.acknowledged) {
      throw new CustomError(500, "Failed to create OTP");
    }

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Check Email Inbox For OTP",
    });
  } catch (err) {
    console.error("[SEND OTP] Error:", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }

    throw err;
  }
}

async function register(req: Request, res: Response) {
  try {
    return apiResponse({
      res: res,
      success: true,
      status: 200,
      message: "Registered success!",
      data: null,
    });
  } catch (err) {
    console.error("[REGISTER] Error:", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }

    throw err;
  }
}

async function login(req: Request, res: Response) {
  return apiResponse({
    res: res,
    success: true,
    status: 200,
    message: "Logged in successfully",
    data: null,
  });
}

async function logout(req: Request, res: Response) {
  return apiResponse({
    res: res,
    success: true,
    status: 200,
    message: "Logged out successfully",
    data: null,
  });
}

export { sendOTP, register, login, logout };
