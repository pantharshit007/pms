import { CookieOptions, Request, Response } from "express";
import { apiResponse } from "../utils/api-response";
import { LoginSchema, OtpSchema, RegisterSchema } from "../validations/auth-schema";
import { CustomError } from "../utils/custom-error";
import { User } from "../models/user.model";
import { generateOtp } from "../utils/otp-generate";
import { decrypt, encrypt } from "../utils/crypt";
import { COOKIE_EXPIRY, otpExpiry } from "../utils/constant";
import { Otp } from "../models/otp.model";
import { sendVerificationEmail } from "../utils/send-mail";
import { env } from "../utils/env";

async function sendOTP(req: Request, res: Response) {
  try {
    const parsedBody = OtpSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { email, fullName, username, password } = parsedBody.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] }).lean();
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
      { email },
      {
        $set: {
          otp,
          data: encryptedData,
          expiresAt,
        },
      },
      { upsert: true }
    );

    await sendVerificationEmail(email, otp);

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
    const otp = req.query.otp as string;

    const parsedData = RegisterSchema.safeParse({ email: req.body.email, otp });
    if (!parsedData.success) {
      throw new CustomError(
        400,
        parsedData.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { email } = parsedData.data;

    const otpRecord = await Otp.findOne({ email, expiresAt: { $gt: new Date() } }).lean();
    if (!otpRecord) {
      throw new CustomError(400, "OTP not found or expired");
    }

    if (otpRecord.otp !== otp) {
      throw new CustomError(400, "Invalid OTP");
    }

    const decryptedData = decrypt(otpRecord.data);
    const { fullName, username, password } = JSON.parse(decryptedData);

    const newUser = await User.create({
      fullName,
      username,
      password,
      email,
    });

    await Otp.deleteOne({ email });

    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const options: CookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: COOKIE_EXPIRY,
      path: "/",
      sameSite: "strict",
    };

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    return apiResponse({
      res: res,
      success: true,
      status: 201,
      message: "Registered success!",
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
  try {
    const parsedBody = LoginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }
    const { email, password } = parsedBody.data;

    const user = await User.findOne({ email });

    if (!user) throw new CustomError(400, "Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new CustomError(400, "Invalid email or password");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const options: CookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: COOKIE_EXPIRY,
      path: "/",
      sameSite: "strict",
    };

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    return apiResponse({
      res: res,
      success: true,
      status: 200,
      message: "Login success!",
    });
  } catch (err) {
    console.error("[LOGIN] Error:", err);
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

async function logout(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    await User.findOneAndUpdate({ _id: userId }, { refreshToken: null });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return apiResponse({
      res: res,
      success: true,
      status: 200,
      message: "Logout success!",
    });
  } catch (err) {
    console.error("[LOGOUT] Error:", err);
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

async function refreshToken(req: Request, res: Response) {
  try {
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "still in work",
    });
  } catch (err) {
    console.error("[REFRESH-TOKEN] Error:", err);
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

async function deleteUser(req: Request, res: Response) {
  try {
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "still in work",
    });
  } catch (err) {
    console.error("[DELETE-USER] Error:", err);
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

export { sendOTP, register, login, logout, refreshToken, deleteUser };
