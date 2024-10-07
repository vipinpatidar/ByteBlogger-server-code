import { rateLimit } from "express-rate-limit";

// Rate limiter for admin users (higher limit)
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes for admins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const error = new Error(
      `Too many requests. You are allowed ${options.limit} requests per ${
        options.windowMs / 60000
      } minutes.`
    );
    error.status = 429;
    next(error);
  },
});

// Rate limiter for non-admin users (lower limit)
const regularUserRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 4, // 3 requests per 15 minutes for regular users
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const error = new Error(
      `Too many requests. You are allowed ${options.limit} requests per ${
        options.windowMs / 60000
      } minutes.`
    );
    error.status = 429;
    next(error);
  },
});

const createBlogRateLimiter = (req, res, next) => {
  if (req.isAdmin) {
    adminRateLimiter(req, res, next); // Apply admin rate limiter
  } else {
    regularUserRateLimiter(req, res, next); // Apply regular user rate limiter
  }
};

const deleteBlogRateLimiter = (req, res, next) => {
  if (req.isAdmin) {
    adminRateLimiter(req, res, next); // Apply admin rate limiter
  } else {
    regularUserRateLimiter(req, res, next); // Apply regular user rate limiter
  }
};

export { createBlogRateLimiter, deleteBlogRateLimiter };
