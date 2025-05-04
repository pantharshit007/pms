import { Router } from "express";
import { projCtxMiddleware } from "../middleware/proj-ctx.middleware";
import { permit } from "../middleware/permit.middleware";
import {
  getTaskById,
  getAllTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  createTask,
  getMyTasks,
} from "../controllers/task.constroller";
import { uploadMiddleware } from "../middleware/multer.middleware";

const taskRouter = Router({ mergeParams: true });

taskRouter.get("/mine", getMyTasks);

taskRouter.use("/", projCtxMiddleware);

taskRouter.post("/create", permit("Task", "create"), uploadMiddleware, createTask);
taskRouter.get("/get/:tId", permit("Task", "view"), getTaskById);
taskRouter.get("/all", permit("Task", "view"), getAllTasks);
taskRouter.patch("/update/:tId", permit("Task", "update"), updateTask);
taskRouter.delete("/delete/:tId", permit("Task", "delete"), deleteTask);
taskRouter.patch("/update-status/:tId", updateTaskStatus);

export { taskRouter };
