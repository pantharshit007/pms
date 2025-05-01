import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { Types } from "mongoose";
import { ProjectMember } from "../models/member.model";

const projCtxMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { pId } = req.params as { pId: string };

    if (!Types.ObjectId.isValid(pId)) throw new CustomError(400, "Invalid Project ID");
    if (!userId) throw new CustomError(401, "Unauthorized");

    const member = await ProjectMember.findOne({
      projectId: new Types.ObjectId(pId),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!member) throw new CustomError(401, "Not Found: Not a member of this project");

    req.member = member;
    next();
  } catch (err) {
    throw new CustomError(400, "Bad Request");
  }
};

export { projCtxMiddleware };
