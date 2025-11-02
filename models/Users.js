import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    hasSeen: Number,
    profileImage: {
    type: String, // URL to image
    default: "",
  },
  },
  { collection: "Users" }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
