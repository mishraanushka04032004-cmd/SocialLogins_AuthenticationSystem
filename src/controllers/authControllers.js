import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/token.js";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
};


export const socialCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/404`);
    }

    const accessToken = signAccessToken(req.user._id);
    const refreshToken = signRefreshToken(req.user._id);

    res.cookie("accessToken", accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.redirect(process.env.CLIENT_URL);
  } catch (err) {
    console.error("❌ Social Callback Error:", err.message);
    return res.redirect(`${process.env.CLIENT_URL}/500`);
  }
};


export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = signAccessToken(decoded.id);

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Refresh Token Error:", err.message);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


export const logout = (_req, res) => {
  res.clearCookie("accessToken", COOKIE_BASE);
  res.clearCookie("refreshToken", COOKIE_BASE);
  res.clearCookie("csrfToken", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};


export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.status(200).json({
    success: true,
    user: req.user,
  });
};
