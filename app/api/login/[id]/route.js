import { NextResponse } from "next/server";
import User from "@/models/Users"; 
import connectMongo from "@/utils/connectMongo";


export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectMongo();

    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { hasSeen } = await req.json();

    await connectMongo();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { hasSeen },
      { new: true }
    );

    if (!updatedUser)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
