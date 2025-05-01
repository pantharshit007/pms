import { Router } from "express";

const noteRouter = Router({ mergeParams: true });

noteRouter.get("/", (req, res) => {
  const { pId, nId } = req.params as { pId: string; nId: string };
  res.send(`Project ID: ${pId}, Note ID: ${nId}`);
});

export { noteRouter };
