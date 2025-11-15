import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Application from "@/models/Application";

export async function GET(req, { params }) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role")?.toLowerCase();
    
    await connectMongo();

    let query = {};

    if (role === "employee") {
      query = name ? { name } : {};
    }

    if (role === "manager") {
      query = name ? { admin: name } : {};
    }

   

    const userApplications = await Application.find(query);

    if (!userApplications || userApplications.length === 0) {
      return NextResponse.json(
        { success: false, message: "No applications found" },
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
