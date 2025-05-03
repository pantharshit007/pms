import { Request, Response } from "express";
import { apiResponse } from "../utils/api-response";
import { CustomError } from "../utils/custom-error";
import { NoteSchema, updateNoteSchema } from "../validations/note-schema";
import { Note } from "../models/note.model";
import { UserRequest } from "../types/type";

async function createNote(req: Request, res: Response) {
  try {
    const parsedBody = NoteSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { title, description } = parsedBody.data;
    const pId = req.params.pId;

    const newNote = await Note.create({
      title,
      description,
      project: pId,
      createdBy: req.user?._id,
    });

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Note created!",
      data: newNote,
    });
  } catch (err) {
    console.error("[CREATE-NOTE] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getAllNotes(req: Request, res: Response) {
  try {
    const { pId } = req.params as { pId: string };

    const notes = await Note.find({ project: pId })
      .populate("createdBy", "fullName username avatar -_id")
      .select("title description updatedAt")
      .lean();

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Notes fetched!",
      data: notes,
    });
  } catch (err) {
    console.error("[GET-ALL-NOTES] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getNoteById(req: Request, res: Response) {
  try {
    const { nId } = req.params as { pId: string; nId: string };
    if (!nId) throw new CustomError(400, "Invalid Note ID");

    const note = await Note.findById(nId)
      .populate("createdBy", "fullName username avatar -_id")
      .select("title description")
      .lean();

    if (!note) throw new CustomError(400, "Invalid Note ID");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Note fetched!",
      data: note,
    });
  } catch (err) {
    console.error("[GET-NOTE-BY-ID] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getAllMyNotes(req: Request, res: Response) {
  try {
    const user = req.user as UserRequest;

    const notes = await Note.find({ createdBy: user._id })
      .select("title description updatedAt")
      .lean();

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Notes fetched!",
      data: notes,
    });
  } catch (err) {
    console.error("[GET-ALL-MY-NOTES] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function updateNote(req: Request, res: Response) {
  try {
    const { nId } = req.params as { nId: string };
    if (!nId) throw new CustomError(400, "Invalid Note ID");

    if (!req.body?.title && !req.body?.description)
      throw new CustomError(400, "One field must be updated");

    const parsedBody = updateNoteSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { title, description } = parsedBody.data;

    const updatedNote = await Note.findByIdAndUpdate(
      nId,
      { title, description },
      { new: true }
    ).select("title description updatedAt");

    if (!updatedNote) throw new CustomError(400, "Failed to update note");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Note updated!",
      data: updatedNote,
    });
  } catch (err) {
    console.error("[UPDATE-NOTE] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function deleteNote(req: Request, res: Response) {
  try {
    const { nId } = req.params as { nId: string };
    if (!nId) throw new CustomError(400, "Invalid Note ID");

    const note = await Note.findByIdAndDelete(nId);
    if (!note) throw new CustomError(400, "Invalid Note ID");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Note deleted!",
    });
  } catch (err) {
    console.error("[DELETE-NOTE] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

export { createNote, getAllNotes, getNoteById, getAllMyNotes, updateNote, deleteNote };
