/**
 * Create an Express error-handling middleware that normalizes Mongoose errors
 * and hides raw internal error messages in production.
 */
export function createErrorHandler(env = process.env) {
  return (err, _req, res, _next) => {
    if (err?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    if (err?.name === "ValidationError") {
      const details = Object.values(err.errors || {})
        .map((item) => item.message)
        .filter(Boolean)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: details || "Validation failed",
      });
    }
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value for a unique field",
      });
    }

    const status = err?.status || err?.statusCode || 500;
    const isProduction = env.NODE_ENV === "production";
    if (status >= 500 && !isProduction) {
      console.error("Unhandled server error:", err);
    } else if (status >= 500) {
      console.error("Unhandled server error:", err?.message || err);
    }

    const message =
      status >= 500 && isProduction
        ? "Internal server error"
        : err?.message || "Internal server error";

    return res.status(status).json({
      success: false,
      message,
    });
  };
}

export const errorHandler = createErrorHandler();
