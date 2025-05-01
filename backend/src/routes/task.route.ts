import { Router } from "express";
import { subTaskRouter } from "./subTask.route";
import { projCtxMiddleware } from "../middleware/proj-ctx.middleware";

const taskRouter = Router({ mergeParams: true });

taskRouter.use("/subtask/:sId", subTaskRouter);

taskRouter.use(projCtxMiddleware);
taskRouter.get("/", (req, res) => {
  const { pId, tId } = req.params as { pId: string; tId: string };
  res.send(`Project ID: ${pId}, Task ID: ${tId}`);
});

export { taskRouter };
