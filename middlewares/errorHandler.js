export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.status || 500;
  // console.error(error);
  res.status(statusCode);

  res.json({
    message: error.message,
    error: error.message,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};
