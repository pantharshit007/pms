import { model, Schema, Document } from "mongoose";
import { compare, hash } from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { ACCOUNT_TYPES } from "../types/role";
import { resetTokenExpiry } from "../utils/constant";
import { env } from "../utils/env";
import { StringValue } from "../types/type";

type UserDocument = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  resetToken: string;
  resetTokenExpires: Date;
  accountType: string;

  comparePassword: (password: string) => Promise<boolean>;
  generateResetToken: () => { token: string; hashedToken: string; tokenExpires: Date };
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
} & Document;

const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
      maxlength: 10,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 16,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    resetToken: String,
    resetTokenExpires: Date,
    accountType: {
      type: String,
      required: true,
      enum: Object.values(ACCOUNT_TYPES),
      default: ACCOUNT_TYPES.user,
    },
  },
  { timestamps: true }
);

async function hashPass(password: string) {
  return await hash(password, 10);
}

function updateAvatar(name: string) {
  return `https://api.dicebear.com/8.x/notionists/svg?seed=${name}`;
}

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  user.password = await hashPass(user.password);
  user.avatar = updateAvatar(user.username);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await compare(password, this.password);
};

userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpires = new Date(Date.now() + resetTokenExpiry);

  return { token, hashedToken, tokenExpires };
};

userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    email: this.email,
  };

  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as StringValue,
  });
};

userSchema.methods.generateRefreshToken = function () {
  const payload = { _id: this._id };

  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as StringValue,
  });
};

export const User = model("User", userSchema);
