import { v2 as cloudinary } from "cloudinary";
import { env } from "../utils/env";
import fs from "fs";
import { CustomError } from "../utils/custom-error";
import { AccountType } from "../types/role";
import { MAX_LIMITS, UPLOAD_FOLDERS } from "../utils/constant";

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET,
});

function checkSize(file: Express.Multer.File, maxSize: number) {
  const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
  return fileSizeInMB < maxSize;
}

type infoType = {
  tags: string[];
  projName: string;
};

/**
 * Upload file to cloudinary
 * @param file file to upload
 * @param role role of the user
 * @param info info to be added to the file `tags` and `folder`
 * @returns response `UploadApiResponse`
 */
async function uploadFile(file: Express.Multer.File, role: AccountType, info: infoType) {
  try {
    if (!file || !file.path) return;

    let fileType: "image" | "pdf" | "docs" = "image";

    if (file.mimetype.startsWith("image/")) fileType = "image";
    else if (file.mimetype === "application/pdf") fileType = "pdf";
    else fileType = "docs";

    const maxSize = MAX_LIMITS[role][fileType];
    if (!checkSize(file, maxSize)) {
      throw new CustomError(
        400,
        `File ${file.originalname} exceeds max size for your account plan (${maxSize / 1024} MB)`
      );
    }

    const folderImg = `${UPLOAD_FOLDERS.image}/${info.projName}/${info.tags[1]}`;
    const folderPdf = `${UPLOAD_FOLDERS.pdf}/${info.projName}/${info.tags[1]}`;
    const folderDocs = `${UPLOAD_FOLDERS.docs}/${info.projName}/${info.tags[1]}`;

    const folder = fileType === "image" ? folderImg : fileType === "pdf" ? folderPdf : folderDocs;

    const options = {
      resourceType: "auto",
      tags: info.tags,
      folder,
    };

    const response = await cloudinary.uploader.upload(file.path, options);

    await fs.unlink(file.path, () => {});
    return response;
  } catch (err: any) {
    fs.unlinkSync(file.path);
    console.error("[UPLOAD-FILE] Error: ", err.message);
    throw new CustomError(500, err.message ?? "Failed to upload file");
  }
}

export { uploadFile };
