import mongoose from "mongoose";

/**
 * Express middleware that rejects malformed MongoDB ObjectId route params with 400
 * before Mongoose throws a CastError.
 */
export function validateObjectId(paramName = "id", label = paramName) {
  return (req, res, next) => {
    const value = req.params?.[paramName];
    if (!mongoose.isValidObjectId(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${label} format`,
      });
    }
    return next();
  };
}
