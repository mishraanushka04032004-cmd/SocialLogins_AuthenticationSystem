import express from "express";
import passport from "passport";
import {
  socialCallback,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  generateCsrfToken,
  verifyCsrf,
} from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get("/csrf-token", generateCsrfToken);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  socialCallback
);

router.get("/fail", (_req, res) =>
  res.redirect(`${process.env.CLIENT_URL}/404`)
);

router.post("/refresh", verifyCsrf, refreshToken);
router.post("/logout", verifyCsrf, logout);
router.get("/me", protect, getMe);

export default router;
