import { model, Schema } from "mongoose";

interface IOtp {
  email: string;
  otp: string;
  data: string;
  expiresAt: Date;
}

export type OtpDocument = IOtp & Document;

const OTPSchema = new Schema<OtpDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-expire expired otps

async function sendVerificationEmail(email: string) {
  return;
}

OTPSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) {
    return next();
  }

  await sendVerificationEmail(this.email);
  next();
});

export const Otp = model<OtpDocument>("Otp", OTPSchema);
