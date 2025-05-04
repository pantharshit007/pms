import { v2 as cloudinary } from "cloudinary";
import { env } from "../utils/env";
import { CustomError } from "../utils/custom-error";

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET,
});

/**
 *  Delete files by public_id
 * @param public_id public_id of the file
 * @param type
 * @returns
 */
async function deleteFilesByPublicId(public_id: string, type = "upload") {
  try {
    // invalidate: to remove cached content
    const options = { type, invalidate: true };

    return await cloudinary.uploader.destroy(public_id, options);
  } catch (err: any) {
    console.error("[DELETE-FILES-ID] Error: ", err.message);
    throw new CustomError(500, err.message ?? "Failed to delete files");
  }
}

/**
 *  Delete files by tag
 * @param tag tag of the file
 * @returns
 */
async function deleteContentByTag(tag: string) {
  try {
    return await cloudinary.api.delete_resources_by_tag(tag);
  } catch (err: any) {
    console.error("[DELETE-FILES-TAG] Error: ", err.message);
    throw new CustomError(500, err.message ?? "Failed to delete files");
  }
}

/**
 *  Delete files by folder location
 * @param folder folder to delete
 * @returns
 */
async function deleteFolders(folder: string) {
  try {
    return await cloudinary.api.delete_resources_by_prefix(folder);
  } catch (err: any) {
    console.error("[DELETE-FILES-FOLDER] Error: ", err.message);
    throw new CustomError(500, err.message ?? "Failed to delete files");
  }
}

export { deleteFilesByPublicId, deleteContentByTag, deleteFolders };
