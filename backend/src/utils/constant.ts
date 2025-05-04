import { AccountType } from "../types/role";

export const resetTokenExpiry = 15 * 60 * 1000;

export const otpExpiry = 10 * 60 * 1000;

export const COOKIE_EXPIRY = 1000 * 60 * 60 * 24 * 7;

export const TASK_STATUS = {
  planning: "PLANNING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export type TaskStatusType = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export const TaskStatus = Object.values(TASK_STATUS);

export const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
];

export const proOnlyMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

type MAX_LIMITS_TYPE = {
  [key in AccountType]: {
    image: number;
    pdf: number;
    docs: number;
  };
};

export const MAX_LIMITS = {
  PRO: {
    image: 5,
    pdf: 10,
    docs: 10,
  },
  USER: {
    image: 3,
    pdf: 0, // no pdf allowed
    docs: 0, // no docs allowed
  },
  ADMIN: {
    image: 10,
    pdf: 20,
    docs: 20,
  },
} satisfies MAX_LIMITS_TYPE;

const IMAGE_FOLDER = "Pms/Image";
const PDF_FOLDER = "Pms/Pdf";
const DOCS_FOLDER = "Pms/Docs";

export const UPLOAD_FOLDERS = {
  image: IMAGE_FOLDER,
  pdf: PDF_FOLDER,
  docs: DOCS_FOLDER,
};
