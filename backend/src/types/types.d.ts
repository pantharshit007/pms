import { UserRequest } from "./type";
import { IMember } from "../models/member.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserRequest;
      member?: IMember;
    }
  }
}

export {};
