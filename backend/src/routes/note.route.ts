import { Router } from "express";
import { projCtxMiddleware } from "../middleware/proj-ctx.middleware";
import { permit } from "../middleware/permit.middleware";
import {
  getNoteById,
  getAllNotes,
  updateNote,
  deleteNote,
  createNote,
  getAllMyNotes,
} from "../controllers/note.controller";

const noteRouter = Router({ mergeParams: true });

noteRouter.get("/mine", getAllMyNotes);

noteRouter.use("/", projCtxMiddleware);

noteRouter.post("/create", permit("Note", "create"), createNote);
noteRouter.get("/get/:nId", permit("Note", "view"), getNoteById);
noteRouter.get("/all", permit("Note", "view"), getAllNotes);
noteRouter.patch("/update/:nId", permit("Note", "update"), updateNote);
noteRouter.delete("/delete/:nId", permit("Note", "delete"), deleteNote);

export { noteRouter };
