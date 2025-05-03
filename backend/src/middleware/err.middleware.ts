import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";

/**
 * unhandled error middleware
 */
export function errMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("[ERR_MIDDLEWARE] Error:", err);
  if (err instanceof CustomError) {
    res.status(err.status ?? 500).json({
      success: false,
      message: err.message ?? "Something went wrong",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message ?? "Something went wrong",
  });

  next();
}
