import nodemailer from "nodemailer";
import { env } from "./env";
import { otpTemplate } from "../templates/otp-template";
import { tryCatch } from "./try-catch";

interface MailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
}

/**
 * sends email w.r.t the given options
 * @param options
 */
async function sendMail(options: MailOptions) {
  const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.MAIL_USERNAME,
      pass: env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const mailResponse = await transporter.sendMail(options);
    return mailResponse.messageId;
  } catch (err) {
    console.error("[SEND MAIL] Error:", err);
    throw new Error("Failed to send email");
  }
}

async function sendVerificationEmail(email: string, otp: string) {
  const title = "Verify your email";
  const options: MailOptions = {
    to: email,
    from: "noreply@pms.com",
    subject: title,
    text: otpTemplate(otp, email, env.CLIENT_URL),
  };

  const { error } = await tryCatch(sendMail(options));
  if (error) throw error;
  return;
}

export { sendMail, sendVerificationEmail };
export type { MailOptions };
