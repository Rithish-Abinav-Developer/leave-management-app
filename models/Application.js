import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  userId:String,
    name:String,
    email:String,
    role:String,
  type: String,
  leaveType: String,
  date: Date,
  toDate: Date,
  time: String,
  hours: String,
  period: String,
  reason: String,
  fileUrl: String,
  status: String,
  profileImage: String,
});

// 🪄 Automatically sort all queries by newest first (_id descending)
ApplicationSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
