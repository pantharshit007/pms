import { UserRequest } from "./type";
import { IMember } from "../models/member.model";
import { ISubtask } from "../models/subtask.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserRequest;
      member?: IMember;
      subTask?: ISubtask;
    }
  }
}

export {};
