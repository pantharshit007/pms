import { Schema, model, Document } from "mongoose";

export interface ISubtask {
  title: string;
  taskId: Schema.Types.ObjectId;
  description: string;
  isComplete: boolean;
  createdBy: Schema.Types.ObjectId;
}

export type SubtaskDocument = ISubtask & Document;

const subtaskSchema = new Schema<SubtaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
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
