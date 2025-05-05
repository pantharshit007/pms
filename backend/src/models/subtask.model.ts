import { Schema, model, Document } from "mongoose";

export interface ISubTask {
  title: string;
  task: Schema.Types.ObjectId;
  description: string;
  isComplete: boolean;
  createdBy: Schema.Types.ObjectId;
}

export type SubTaskDocument = ISubTask & Document;

const subTaskSchema = new Schema<SubTaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
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
      minlength: 2,
      maxlength: 1000,
    },
    isComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const SubTask = model<SubTaskDocument>("SubTask", subTaskSchema);
