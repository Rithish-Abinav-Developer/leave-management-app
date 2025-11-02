import Users from "@/models/Users";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const adminNotification = await req.json();
    // console.log("Admin notification:", adminNotification);

    const result = await Users.updateMany(
      { role: "admin" },
      { $inc: { hasSeen: 1 } }
    );

    // console.log("Admins updated:", result);

    return NextResponse.json({
      success: true,
      message: "Admin notifications updated successfully",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating admin notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
