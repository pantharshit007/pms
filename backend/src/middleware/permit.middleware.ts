import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../types/type";
import { IMember } from "../models/member.model";
import { ActionForResource, hasPermission, PermissionSchema } from "../lib/permit";
import { CustomError } from "../utils/custom-error";
import { apiResponse } from "../utils/api-response";

type ExcludedResouce = Exclude<keyof PermissionSchema, "SubTask">;

/**
 * Middleware to check if user has permission to perform action on resource `No Attribute based checks allowed`
 * @resourceType - `Project | Note | Task | SubTask`
 * @action - Action `create`, `view`, `update`, `delete`
 * @returns
 */
function permit<R extends ExcludedResouce, A extends ActionForResource<R> = ActionForResource<R>>(
  resourceType: R,
  action: A
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserRequest;
    const memberShip = req.member as IMember;

    if (typeof action !== "string") throw new CustomError(400, "Invalid Action"); // no func allowed here

    const isAllowed = hasPermission<ExcludedResouce, A>({ user, memberShip, resourceType, action });
    if (!isAllowed.success) {
      return apiResponse({
        res,
        success: false,
        status: 401,
        message: isAllowed.message,
      });
    }

    next();
  };
}

export { permit };
