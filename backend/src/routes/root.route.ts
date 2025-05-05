import { Router } from "express";
import { authRouter } from "./auth.route";
import { projectRouter } from "./project.route";
import { authMiddleware } from "../middleware/auth.middleware";
import { noteRouter } from "./note.route";
import { taskRouter } from "./task.route";
import { subTaskRouter } from "./subTask.route";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
//? proj: /proj/[action]/:pId
rootRouter.use("/proj", authMiddleware, projectRouter);
//? note: /proj/:pId/note/[action]/:nId
rootRouter.use("/proj/:pId/note", authMiddleware, noteRouter);
//? task: /proj/:pId/task/[action]/:tId
rootRouter.use("/proj/:pId/task", authMiddleware, taskRouter);
//? subtask: /proj/:pId/task/:tId/subtask/[action]/:sId
rootRouter.use("/proj/:pId/task/:tId/subtask", authMiddleware, subTaskRouter);

export { rootRouter };
