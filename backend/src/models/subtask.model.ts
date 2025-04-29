import { Schema, model, Document } from "mongoose";

interface Subtask {
  title: string;
  task: Schema.Types.ObjectId;
  description: string;
  isComplete: boolean;
  createdBy: Schema.Types.ObjectId;
}

export type SubtaskDocument = Subtask & Document;

const subtaskSchema = new Schema<SubtaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isComplete: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Subtask = model<SubtaskDocument>("Subtask", subtaskSchema);
