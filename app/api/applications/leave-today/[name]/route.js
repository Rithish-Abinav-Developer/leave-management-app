import Application from "@/models/Application";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongo();

    const { name } = await params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const utcToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    console.log("UTC Today:", utcToday);

    const applications = await Application.aggregate([
      {
        $match: {
          name: { $ne: name }, 
          status: "Approved",
          date: { $lte: utcToday },
          toDate: { $gte: utcToday },
        },
      },
      {
        $sort: { date: -1 }, 
      },
      {
        $group: {
          _id: "$userId", 
          latestApplication: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestApplication" },
      },
    ]);

    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, message: "No applications found for today" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
