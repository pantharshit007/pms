import { Document, model, Schema } from "mongoose";
import { PROJECT_ROLES, ProjectRole, ProjectRoleType } from "../types/role";

export interface IMember {
  project: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  role: ProjectRoleType;
}

export type MemberDocument = IMember & Document;

const projectMemberSchema = new Schema<MemberDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
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

projectMemberSchema.index({ project: 1, user: 1 });
export const ProjectMember = model<MemberDocument>("ProjectMember", projectMemberSchema);
