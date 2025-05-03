import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";
import jwt from "jsonwebtoken";
import { env } from "../utils/env";
import { UserRequest } from "../types/type";
import { apiResponse } from "../utils/api-response";
import { ACCOUNT_ROLES, AccountRole, AccountType } from "../types/role";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) throw new CustomError(401, "Unauthorized");

    const payload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
    req.user = payload as UserRequest;
    next();
  } catch (err: any) {
    if (err.message === "jwt expired") {
      return apiResponse({
        res,
        success: false,
        status: 401,
        message: "Session expired, re-login!",
      });
    }
    throw new CustomError(401, "Unauthorized: " + err.message);
  }
};

function checkAuth(accountRole: AccountType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as UserRequest;
      if (!accountRole.includes(user.accountRole)) {
        return apiResponse({
          res,
          success: false,
          status: 401,
          message: "Unauthorized: Insufficient permissions",
        });
      }
      next();
    } catch (err: any) {
      throw new CustomError(400, `Bad Request: ${err.message}`);
    }
  };
}

export { authMiddleware, checkAuth };
