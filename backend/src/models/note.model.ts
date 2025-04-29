import { model, Schema, Document } from "mongoose";

interface INote {
  createdBy: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  content: string;
}

export type NoteDocument = INote & Document;

const noteSchema = new Schema<NoteDocument>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Note = model<NoteDocument>("Note", noteSchema);
