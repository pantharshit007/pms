import { model, Schema, Document } from "mongoose";
import { TaskStatus, TaskStatusType } from "../utils/constant";

interface Attatchment {
  url: string;
  mimeType: string;
  size: number;
}

export interface ITask {
  title: string;
  description: string;
  projectId: Schema.Types.ObjectId;
  assignedTo: Schema.Types.ObjectId;
  assignedBy: Schema.Types.ObjectId;
  status: TaskStatusType;
  attachments: Attatchment[];
}

export type TaskDocument = ITask & Document;

const taskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TaskStatus),
    },
    attachments: {
      type: [
        {
          url: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
