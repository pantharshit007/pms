import { model, Schema } from "mongoose";

interface IOtp {
  email: string;
  otp: string;
  data: string;
  expiresAt: Date;

  sendVerificationEmail: () => Promise<void>;
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

export const Otp = model<OtpDocument>("Otp", OTPSchema);
