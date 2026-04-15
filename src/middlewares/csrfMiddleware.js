import crypto from "crypto";

export const generateCsrfToken = (_req, res) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false, 
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({ csrfToken });
};

export const verifyCsrf = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};
