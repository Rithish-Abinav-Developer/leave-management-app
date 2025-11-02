import connectMongo from "@/utils/connectMongo";
import User from "@/models/Users";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { name } = await params;
    const body = await req.json();
    const { hasSeen, increment } = body;

    await connectMongo();
    console.log(name, hasSeen, increment);

    let update = {};

    if (increment) {
      update = { $inc: { hasSeen: 1 } };
    } else if (hasSeen !== undefined) {
      update = { hasSeen };
    }

    const updatedUser = await User.findOneAndUpdate({ name }, update, {
      new: true,
    });

    if (!updatedUser)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: increment ? "Incremented successfully" : "Updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
