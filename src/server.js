import dotenv from "dotenv";
// import path from "path";

/**
 * ================================
 * Load ENV (MUST BE FIRST)
 * ================================
 */
// dotenv.config({
//   path: path.resolve(process.cwd(), "src/.env"),
// });
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { logger } from "./utils/logger.js";

/**
 * ================================
 * Passport (AFTER dotenv)
 * ================================
 */
import "./config/passport.js";

/**
 * ================================
 * Env validation
 * ================================
 */
if (
  !process.env.CLIENT_URL ||
  !process.env.JWT_SECRET ||
  !process.env.JWT_REFRESH_SECRET ||
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET
) {
  throw new Error("❌ Missing required environment variables");
}

/**
 * ================================
 * DB
 * ================================
 */
connectDB();

const app = express();

/**
 * ================================
 * Trust proxy (Render)
 * ================================
 */
app.set("trust proxy", 1);

/**
 * ================================
 * Security
 * ================================
 */
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * ================================
 * Core middleware
 * ================================
 */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/**
 * ================================
 * Logging
 * ================================
 */
app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

/**
 * ================================
 * Passport
 * ================================
 */
app.use(passport.initialize());

/**
 * ================================
 * Routes
 * ================================
 */
app.use("/auth", authRoutes);

/**
 * ================================
 * Health
 * ================================
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/**
 * ================================
 * 404
 * ================================
 */
app.all("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * ================================
 * Error handler
 * ================================
 */
app.use(errorHandler);

/**
 * ================================
 * Start server
 * ================================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
