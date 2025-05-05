import { Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { apiResponse } from "../utils/api-response";
import { TaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../validations/task-schema";
import { uploadFile } from "../lib/upload-files";
import { UserRequest } from "../types/type";
import { Task } from "../models/task.model";
import { User, UserDocument } from "../models/user.model";
import { IMember, ProjectMember } from "../models/member.model";
import { startSession } from "mongoose";
import { SubTask } from "../models/subtask.model";
import { deleteContentByTag } from "../lib/delete-files";
import { tryCatch } from "../utils/try-catch";
import { MAX_TASK_ATTACHMENTS } from "../utils/constant";
import { hasPermission } from "../lib/permit";

async function createTask(req: Request, res: Response) {
  const session = await startSession();
  try {
    const parsedBody = TaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { title, description, email } = parsedBody.data;
    const pId = req.params.pId;
    const user = req.user as UserRequest;

    if (req.files && (req.files.length as number) > MAX_TASK_ATTACHMENTS) {
      throw new CustomError(400, `Max attachments reached: ${MAX_TASK_ATTACHMENTS}`);
    }

    const assignedTo = await User.findOne({ email }).lean();
    if (!assignedTo) throw new CustomError(400, "Invalid email");

    const isProjectMember = await ProjectMember.findOne({
      project: pId,
      user: assignedTo._id,
    })
      .populate("project", "name -_id")
      .lean();
    if (!isProjectMember) throw new CustomError(400, "Not a member of this project");

    // @ts-ignore
    const projName = isProjectMember.project.name as string;

    session.startTransaction();

    async function commit() {
      const newTask = await Task.create({
        title,
        description,
        project: pId,
        assignedTo: assignedTo?._id,
        assignedBy: user._id,
      });

      const tags = { pId: `pId:${pId}`, tId: `tId:${newTask._id}` };
      const info = {
        tags: [tags.pId, tags.tId],
        projName,
      };

      const promise = (req.files as Express.Multer.File[]).map(async (attachment) => {
        const res = await uploadFile(attachment, user.accountRole, info);
        return {
          url: res?.secure_url ?? "",
          mimeType: attachment.mimetype,
          size: attachment.size,
        };
      });

      const attachments = await Promise.all(promise);

      newTask.attachments = attachments;
      await newTask.save();

      return newTask;
    }

    const committed = await tryCatch(commit());
    if (committed.error) {
      session.abortTransaction();
      throw new CustomError(500, `Failed: ${committed.error.message}`);
    }

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Task created!",
      data: committed.data,
    });
  } catch (err) {
    console.error("[CREATE-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function getTaskById(req: Request, res: Response) {
  try {
    const { tId } = req.params as { tId: string };

    const task = await Task.findById(tId)
      .populate("assignedTo", "fullName avatar username -_id")
      .populate("assignedBy", "fullName avatar username -_id")
      .select("title description assignedTo assignedBy status attachments updatedAt")
      .lean();
    if (!task) throw new CustomError(400, "Task not found");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Task fetched!",
      data: task,
    });
  } catch (err) {
    console.error("[GET-TASK-BY-ID] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getAllTasks(req: Request, res: Response) {
  try {
    const { pId } = req.params as { pId: string };

    const tasks = await Task.find({ project: pId })
      .populate("assignedTo", "fullName avatar username -_id")
      .populate("assignedBy", "fullName avatar username -_id")
      .select("title description assignedTo assignedBy status attachments updatedAt")
      .lean();
    if (!tasks) throw new CustomError(400, "No tasks found");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Tasks fetched!",
      data: tasks,
    });
  } catch (err) {
    console.error("[GET-ALL-TASKS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getMyTasks(req: Request, res: Response) {
  try {
    const user = req.user as UserRequest;

    const tasks = await Task.find({ assignedTo: user._id })
      .populate("assignedBy", "fullName avatar username -_id")
      .select("title description assignedTo assignedBy status attachments updatedAt")
      .lean();
    if (!tasks) throw new CustomError(400, "No tasks found");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Tasks fetched!",
      data: tasks,
    });
  } catch (err) {
    console.error("[GET-MY-TASKS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function updateTask(req: Request, res: Response) {
  try {
    const parsedBody = updateTaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { pId, tId } = req.params as { pId: string; tId: string };
    const { title, description, email, status } = parsedBody.data;

    let assignedTo: UserDocument | null | undefined = undefined;
    if (email !== undefined) {
      assignedTo = await User.findOne({ email }).lean();
      if (!assignedTo) throw new CustomError(400, "Invalid email");

      const isProjectMember = await ProjectMember.findOne({
        project: pId,
        user: assignedTo?._id,
      }).lean();
      if (!isProjectMember) throw new CustomError(400, "Not a member of this project");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      tId,
      { title, description, status, assignedTo: assignedTo?._id?.toString() },
      { new: true }
    ).select("title description status updatedAt");

    if (!updatedTask) throw new CustomError(400, "Failed to update task");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Task updated!",
      data: updatedTask,
    });
  } catch (err) {
    console.error("[UPDATE-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function deleteTask(req: Request, res: Response) {
  const session = await startSession();
  try {
    const { tId } = req.params as { tId: string };

    const existingTask = await Task.findById(tId).lean();
    if (!existingTask) throw new CustomError(400, "Task not found");

    session.startTransaction();

    async function commit() {
      await SubTask.deleteMany({ task: tId });
      await deleteContentByTag(`tId:${tId}`); // delete attachments
      await Task.findByIdAndDelete(tId);
      return;
    }

    const committed = await tryCatch(commit());
    if (committed.error) {
      session.abortTransaction();
      throw new CustomError(500, `Failed to delete task: ${committed.error.message}`);
    }

    await session.commitTransaction();
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Task deleted!",
    });
  } catch (err) {
    console.error("[DELETE-TASK] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function updateTaskStatus(req: Request, res: Response) {
  try {
    const { pId, tId } = req.params as { pId: string; tId: string };
    const user = req.user as UserRequest;
    const memberShip = req.member as IMember;

    const task = await Task.findById(tId).lean();
    if (!task) throw new CustomError(400, "Task not found");

    const isAllowed = hasPermission({
      user,
      memberShip,
      resourceType: "Task",
      action: "updateStatus",
      resource: { ...task, tId },
    });
    if (!isAllowed.success) throw new CustomError(401, isAllowed.message);

    const parsedBody = updateTaskStatusSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { status } = parsedBody.data;

    if (task.status === status) throw new CustomError(400, "Same status can't be assigned");

    const updatedTask = await Task.findByIdAndUpdate(tId, { status }, { new: true });
    if (!updatedTask) throw new CustomError(400, "Failed to update task");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Task status updated!",
      data: updatedTask,
    });
  } catch (err) {
    console.error("[UPDATE-TASK-STATUS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

export {
  createTask,
  getAllTasks,
  getTaskById,
  getMyTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
