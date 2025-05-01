import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { Subtask } from "../models/subtask.model";

const subTaskCtxMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tId, sId } = req.params as { tId: string; sId: string };

    if (!tId || !sId) throw new CustomError(400, "Invalid Task ID or Subtask ID");
    const subTask = await Subtask.findOne({ _id: sId, taskId: tId }).lean();
    if (!subTask) throw new CustomError(400, "Invalid Task ID or Subtask ID");

    req.subTask = subTask;
    next();
  } catch (err) {
    throw new CustomError(400, "Bad Request");
  }
};

export { subTaskCtxMiddleware };
