import { Request, Response } from "express";
import { createSubTaskSchema, updateSubTaskSchema } from "../validations/subTask-schema";
import { SubTask } from "../models/subtask.model";
import { apiResponse } from "../utils/api-response";
import { CustomError } from "../utils/custom-error";
import { Task } from "../models/task.model";
import { hasPermission } from "../lib/permit";
import { UserRequest } from "../types/type";
import { IMember } from "../models/member.model";

async function createSubTask(req: Request, res: Response) {
  try {
    const parsedBody = createSubTaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { title, description } = parsedBody.data;
    const { tId } = req.params as { tId: string };
    const user = req.user as UserRequest;

    const isAllowed = hasPermission({
      user,
      memberShip: undefined,
      resourceType: "SubTask",
      action: "create",
    });
    if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

    const isTaskExists = await Task.findById(tId);
    if (!isTaskExists) throw new CustomError(400, "Task not found");

    if (isTaskExists.subTasks >= 10) throw new CustomError(400, "Task has reached its limit");

    const subtask = await SubTask.create({
      title,
      description,
      task: tId,
      createdBy: user._id,
    });

    if (!subtask) throw new CustomError(400, "Error creating subtask");

    await isTaskExists.updateOne({ $inc: { subTasks: 1 } });

    return apiResponse({
      res,
      success: true,
      status: 201,
      message: "Subtask created!",
      data: subtask,
    });
  } catch (err) {
    console.log("[CREATE-SUB-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
        data: null,
      });
    }
    throw err;
  }
}

async function getSubTaskById(req: Request, res: Response) {
  const { tId, sId } = req.params as { tId: string; sId: string };
  const user = req.user as UserRequest;
  const memberShip = req.member as IMember;

  const existingSubTask = await SubTask.findById(sId).lean();
  if (!existingSubTask) throw new CustomError(400, "SubTask not found");

  const isAllowed = hasPermission({
    user,
    memberShip,
    resourceType: "SubTask",
    action: "view",
    resource: { ...existingSubTask, tId },
  });
  if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

  const subTask = await SubTask.findById(sId)
    .populate("task", "title _id")
    .populate("createdBy", "fullName avatar username")
    .lean();

  return apiResponse({
    res,
    success: true,
    status: 200,
    message: "Subtask fetched!",
    data: subTask,
  });
}

async function getMySubTasks(req: Request, res: Response) {
  try {
    const user = req.user as UserRequest;

    const subTasks = await SubTask.find({ createdBy: user._id })
      .select("title description createdBy updatedAt isComplete")
      .lean();
    if (!subTasks) throw new CustomError(400, "No subtasks found");

    if (subTasks.length === 0) {
      return apiResponse({
        res,
        success: false,
        status: 200,
        message: "You have no subtasks! Did you completed all those already?",
        data: null,
      });
    }

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Subtasks fetched!",
      data: subTasks,
    });
  } catch (err) {
    console.log("[GET-MY-SUB-TASKS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
        data: null,
      });
    }
    throw err;
  }
}

async function updateSubTask(req: Request, res: Response) {
  try {
    const parsedBody = updateSubTaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { title, description, isComplete } = parsedBody.data;
    const { sId, tId } = req.params as { sId: string; tId: string };
    const user = req.user as UserRequest;
    const memberShip = req.member as IMember;

    const existingSubTask = await SubTask.findById(sId).lean();
    if (!existingSubTask) throw new CustomError(400, "SubTask not found");

    const isAllowed = hasPermission({
      user,
      memberShip,
      resourceType: "SubTask",
      action: "update",
      resource: { ...existingSubTask, tId },
    });
    if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

    if (
      existingSubTask.title === title &&
      existingSubTask.description === description &&
      existingSubTask.isComplete === isComplete
    ) {
      return apiResponse({
        res,
        success: false,
        status: 200,
        message: "No changes made",
      });
    }

    const updatedSubTask = await SubTask.findByIdAndUpdate(
      sId,
      { title, description, isComplete },
      { new: true }
    );
    if (!updatedSubTask) throw new CustomError(400, "Failed to update subtask");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Subtask updated!",
      data: updatedSubTask,
    });
  } catch (err) {
    console.log("[UPDATE-SUB-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
        data: null,
      });
    }
    throw err;
  }
}

async function deleteSubTask(req: Request, res: Response) {
  try {
    const { sId, tId } = req.params as { sId: string; tId: string };
    const user = req.user as UserRequest;
    const memberShip = req.member as IMember;

    const existingSubTask = await SubTask.findById(sId).lean();
    if (!existingSubTask) throw new CustomError(400, "SubTask not found");

    const isAllowed = hasPermission({
      user,
      memberShip,
      resourceType: "SubTask",
      action: "delete",
      resource: { ...existingSubTask, tId },
    });
    if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

    const subToBeDeleted = await SubTask.deleteOne({ _id: sId });
    if (!subToBeDeleted) throw new CustomError(400, "Failed to delete subtask");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Subtask deleted!",
    });
  } catch (err) {
    console.log("[DELETE-SUB-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
        data: null,
      });
    }
    throw err;
  }
}

async function completeSubTask(req: Request, res: Response) {
  try {
    const { sId, tId } = req.params as { sId: string; tId: string };
    const user = req.user as UserRequest;
    const memberShip = req.member as IMember;

    const existingSubTask = await SubTask.findById(sId).lean();
    if (!existingSubTask) throw new CustomError(400, "SubTask not found");

    const isAllowed = hasPermission({
      user,
      memberShip,
      resourceType: "SubTask",
      action: "complete",
      resource: { ...existingSubTask, tId },
    });
    if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

    if (existingSubTask.isComplete) {
      return apiResponse({
        res,
        success: false,
        status: 200,
        message: "This subtask is already completed",
      });
    }

    const completedSubTask = await SubTask.findByIdAndUpdate(sId, { isComplete: true });
    if (!completedSubTask) throw new CustomError(400, "Failed to complete subtask");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Subtask completed!",
      data: completedSubTask,
    });
  } catch (err) {
    console.log("[COMPLETE-SUB-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
        data: null,
      });
    }
    throw err;
  }
}

export {
  createSubTask,
  getSubTaskById,
  getMySubTasks,
  updateSubTask,
  deleteSubTask,
  completeSubTask,
};
