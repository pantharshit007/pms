import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";
import jwt from "jsonwebtoken";
import { env } from "../utils/env";
import { UserRequest } from "../types/type";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) throw new CustomError(401, "Unauthorized");

    const payload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
    req.user = payload as UserRequest;
    next();
  } catch (err) {
    throw new CustomError(401, "Unauthorized");
  }
};

export { authMiddleware };
