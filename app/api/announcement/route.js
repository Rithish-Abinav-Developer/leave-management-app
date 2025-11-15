import Announcement from "@/models/Announcement";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await connectMongo();

  const { announcementText  } = await req.json();

  const announcement = await Announcement.findOneAndUpdate(
    {},                 
    { $set: { text:announcementText} }, 
    { new: true }
  );

  return NextResponse.json({
    message: "Announcement updated successfully",
    announcement
  });
}

export async function GET(req) {
  await connectMongo();

  const announcement = await Announcement.findOne({});

  return NextResponse.json(announcement);
}

