import { Router } from "express";
import {
  createSubTask,
  getSubTaskById,
  getMySubTasks,
  updateSubTask,
  deleteSubTask,
  completeSubTask,
} from "../controllers/subTask.controller";
import { projCtxMiddleware } from "../middleware/proj-ctx.middleware";

const subTaskRouter = Router({ mergeParams: true });

subTaskRouter.post("/create", createSubTask);
subTaskRouter.get("/mine", getMySubTasks);

subTaskRouter.use("/", projCtxMiddleware);

subTaskRouter.get("/get/:sId", getSubTaskById);
subTaskRouter.patch("/update/:sId", updateSubTask);
subTaskRouter.delete("/delete/:sId", deleteSubTask);
subTaskRouter.patch("/complete/:sId", completeSubTask);

export { subTaskRouter };
