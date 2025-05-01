import { Router } from "express";
import { taskRouter } from "./task.route";
import { noteRouter } from "./note.route";

const projectRouter = Router({ mergeParams: true });

projectRouter.use("/task/:tId", taskRouter);
projectRouter.use("/note/:nId", noteRouter);

projectRouter.get("/", (req, res) => {
  const { pId } = req.params as { pId: string };
  res.send(`Project ID: ${pId}`);
});
export { projectRouter };
