import { Request, Response, NextFunction } from "express";

/**
 * unhandled error middleware
 */
export function errMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("[ERR_MIDDLEWARE] Error:", err);
  res.status(500).json({
    success: false,
    message: err.message ?? "Something went wrong",
    data: null,
  });

  next();
}
