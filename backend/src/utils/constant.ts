export const resetTokenExpiry = 15 * 60 * 1000;

export const otpExpiry = 10 * 60 * 1000;

export const COOKIE_EXPIRY = 1000 * 60 * 60 * 24 * 7;

export const TaskStatus = {
  planning: "PLANNING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
