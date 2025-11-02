import { NextResponse } from "next/server";
import Application from "@/models/Application";
import connectMongo from "@/utils/connectMongo";

export async function PUT(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params;
    const { status } = await req.json();

    const application = await Application.findByIdAndUpdate(id, { status });
    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    application.status = status;
    await application.save();

    return NextResponse.json({ message: "Application status updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
