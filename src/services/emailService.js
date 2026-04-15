import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email, username) => {
  try {
    await transporter.sendMail({
      from: `"ProjectUI" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to ProjectUI 🚀",
      html: `<h2>Welcome ${username}</h2><p>You’re in 🎉</p>`,
    });
  } catch (e) {
    console.error("Email error:", e.message);
  }
};
