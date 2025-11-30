const { ZodError } = require("zod");

/* Format Zod validation errors */
function formatZodError(error) {
  return error.errors.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/* 404 Handler */
function notFoundHandler(req, _res, next) {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404; // Not Found
  next(error);
}

/* Global Error Handler */
function errorHandler(err, _req, res, _next) {
  console.error("❌ Error:", err);

  /** -------------------------
   *  Zod Validation Error
   * ------------------------*/
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(err),
    });
  }

  /** -------------------------
   *  Default Status Code
   * ------------------------*/
  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  const payload = {
    message: err.message || "Internal Server Error",
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
