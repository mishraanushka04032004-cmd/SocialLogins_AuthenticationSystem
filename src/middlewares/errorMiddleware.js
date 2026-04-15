export const errorHandler = (err, _req, res, _next) => {
  console.error("❌ Global Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? err.message || "Internal Server Error"
        : err.stack || err.message,
  });
};
