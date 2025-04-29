import { Document, model, Schema } from "mongoose";
import { UserDocument } from "./user.model";

interface IProject {
  name: string;
  description: string;
  createdBy: Schema.Types.ObjectId;
}

interface IProjectPopulated {
  name: string;
  description: string;
  createdBy: UserDocument;
}

export type ProjectDocument = IProject & Document;
export type ProjectPopulatedDocument = IProjectPopulated & Document;

const projectSchema = new Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Project = model<ProjectDocument>("Project", projectSchema);
