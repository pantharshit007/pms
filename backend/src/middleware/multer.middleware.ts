import multer from "multer";
import path from "path";
import { allowedMimeTypes, proOnlyMimeTypes } from "../utils/constant";
import { CustomError } from "../utils/custom-error";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, "public/uploads/images");
    else if (file.mimetype.startsWith("application/pdf")) cb(null, "public/uploads/pdf");
    else cb(null, "public/uploads/docs");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.originalname.replace(/\s/g, "-") + uniqueSuffix + extension);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new CustomError(400, "Unsupported file type"));
  }

  // Restrict pro-only files
  const allowedRoles = ["PRO", "ADMIN"];
  if (proOnlyMimeTypes.includes(file.mimetype) && !allowedRoles.includes(req.user!.accountRole)) {
    return cb(new CustomError(400, "This file type is restricted to PRO users"));
  }

  cb(null, true);
};

/**
 * Multer middleware to upload files
 * @returns req.attachments
 */
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
  fileFilter,
}).array("attachments", 10); // max 10 attachments

export { uploadMiddleware };
