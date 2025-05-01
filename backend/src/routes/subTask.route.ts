import { Router } from "express";

const subTaskRouter = Router({ mergeParams: true });

subTaskRouter.get("/", (req, res) => {
  const { pId, tId, sId } = req.params as { pId: string; tId: string; sId: string };
  res.send(`Project ID: ${pId}, Task ID: ${tId}, Subtask ID: ${sId}`);
});

export { subTaskRouter };
