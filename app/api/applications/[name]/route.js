import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Application from "@/models/Application";

export async function GET(req, { params }) {
  try {
    const { name } = await params;              
    // console.log("Requested name:", name);

    await connectMongo();

    const userApplications = await Application.find({ name });

    if (!userApplications || userApplications.length === 0) {
      return NextResponse.json(
        { success: false, message: "No applications found for this name" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userApplications,
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}


