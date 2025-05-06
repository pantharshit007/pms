import { Router } from "express";
import { authRouter } from "./auth.route";
import { projectRouter } from "./project.route";
import { authMiddleware } from "../middleware/auth.middleware";
import { noteRouter } from "./note.route";
import { taskRouter } from "./task.route";
import { subTaskRouter } from "./subTask.route";
import { rateLimiter } from "../middleware/ratelimit.middleware";

const rootRouter = Router();

rootRouter.use("/auth", rateLimiter(10, 5), authRouter);
//? proj: /proj/[action]/:pId
rootRouter.use("/proj", rateLimiter(15, 10), projectRouter);
//? note: /proj/:pId/note/[action]/:nId
rootRouter.use("/proj/:pId/note", rateLimiter(10, 5), noteRouter);
//? task: /proj/:pId/task/[action]/:tId
rootRouter.use("/proj/:pId/task", rateLimiter(10, 5), taskRouter);
//? subtask: /proj/:pId/task/:tId/subtask/[action]/:sId
rootRouter.use("/proj/:pId/task/:tId/subtask", rateLimiter(10, 5), subTaskRouter);

export { rootRouter };
