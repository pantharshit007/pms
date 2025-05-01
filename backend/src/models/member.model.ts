import { Document, model, Schema } from "mongoose";
import { PROJECT_ROLES, ProjectRole, ProjectRoleType } from "../types/role";

export interface IMember {
  projectId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: ProjectRoleType;
}

export type MemberDocument = IMember & Document;

const projectMemberSchema = new Schema<MemberDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ProjectRole,
      default: PROJECT_ROLES.member,
    },
  },
  { timestamps: true }
);

export const ProjectMember = model<MemberDocument>("ProjectMember", projectMemberSchema);
