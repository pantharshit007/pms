import { rateLimit } from "express-rate-limit";

/**
 * rateLimiter middleware
 * @param minute minutes to wait
 * @param maxReq max requests allowed in that minute
 * @returns
 */
function rateLimiter(minute: number, maxReq: number) {
  return rateLimit({
    windowMs: minute * 60 * 1000,
    max: maxReq,
    message: {
      status: 429,
      message: `Too many requests try again in ${minute} minutes`,
    },
  });
}

export { rateLimiter };
