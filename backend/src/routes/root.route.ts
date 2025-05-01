import { Router } from "express";
import { authRouter } from "./auth.route";
import { projectRouter } from "./project.route";
import { authMiddleware } from "../middleware/auth.middleware";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/proj/:pId", authMiddleware, projectRouter);
//? note: /proj/:pId/note/:nId
//? task: /proj/:pId/task/:tId
//? subtask: /proj/:pId/task/:tId/subtask/:sId

export { rootRouter };
