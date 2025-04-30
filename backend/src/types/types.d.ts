import { UserRequest } from "./type";

declare global {
  namespace Express {
    interface Request {
      user?: UserRequest;
    }
  }
}

export {};
