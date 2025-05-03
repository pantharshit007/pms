import { Schema } from "mongoose";
import { AccountType, ProjectRoleType } from "./role";

type Unit =
  | "Years"
  | "Year"
  | "Yrs"
  | "Yr"
  | "Y"
  | "Weeks"
  | "Week"
  | "W"
  | "Days"
  | "Day"
  | "D"
  | "Hours"
  | "Hour"
  | "Hrs"
  | "Hr"
  | "H"
  | "Minutes"
  | "Minute"
  | "Mins"
  | "Min"
  | "M"
  | "Seconds"
  | "Second"
  | "Secs"
  | "Sec"
  | "s"
  | "Milliseconds"
  | "Millisecond"
  | "Msecs"
  | "Msec"
  | "Ms";

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export type StringValue = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;

export type UserRequest = {
  _id: string;
  username: string;
  email: string;
  accountRole: AccountType;
};

// \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\

export type fetchMyProjectsAPI = {
  role: ProjectRoleType;
  totalMembers: number;
  pId: Schema.Types.ObjectId;
  name: string;
  description: string;
  createdBy: { email: string; username: string };
};

type getProjectMembersArrAPI = {
  _id: Schema.Types.ObjectId;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  role: ProjectRoleType;
};

export type getProjectMembersAPI = {
  totalMembers: number;
  members: getProjectMembersArrAPI[];
};
