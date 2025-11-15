import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    text:String
  },
  { collection: "Announcements" }
);

export default mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
