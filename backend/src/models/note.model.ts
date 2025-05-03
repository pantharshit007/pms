import { model, Schema, Document } from "mongoose";

interface INote {
  createdBy: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  title: string;
  description: string;
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
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const Note = model<NoteDocument>("Note", noteSchema);
