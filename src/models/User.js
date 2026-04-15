import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    avatar: String,
    provider: {
      type: String,
      enum: ["google", "github", "discord"],
      required: true,
    },
    providerId: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
