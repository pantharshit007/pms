export const resetTokenExpiry = 15 * 60 * 1000;

export const otpExpiry = 10 * 60 * 1000;

export const TaskStatus = {
  planning: "PLANNING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
