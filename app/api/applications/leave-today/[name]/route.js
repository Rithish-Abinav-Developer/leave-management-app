import Application from "@/models/Application";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongo();

    const { name } = params;

    // 🔹 Get today's full range (local timezone)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🔹 Convert to UTC to match stored ISO dates in Mongo
    const utcStart = new Date(startOfDay.getTime() - startOfDay.getTimezoneOffset() * 60000);
    const utcEnd = new Date(endOfDay.getTime() - endOfDay.getTimezoneOffset() * 60000);

    const applications = await Application.aggregate([
      {
        $match: {
          name: { $ne: name },
          status: "Approved",
          date: { $lte: utcEnd },
          toDate: { $gte: utcStart },
        },
      },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$userId",
          latestApplication: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestApplication" } },
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
