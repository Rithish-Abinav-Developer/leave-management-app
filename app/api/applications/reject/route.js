import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Application from "@/models/Application";
import axios from "axios";

export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("Application ID is missing");

    const application = await Application.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );

    if (!application) throw new Error("Application not found");

    const html = `
  <div style="font-family: Arial, sans-serif; background: #f7f9fc; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #e74c3c;">❌ Your Application Has Been Rejected</h2>
      <p>Dear <strong>${application.name}</strong>,</p>

      ${
        application.type === "Leave"
          ? `<p>Your leave application for <strong>${application.leaveType}</strong> from 
              <b>${application.date}${application.fromPeriod == 0.5 ? " (Half Day)" : ""}</b> 
              ${application.toDate ? `to <b>${application.toDate}${application.toPeriod == 0.5 ? " (Half Day)" : ""}</b>` : ""} 
              has been <b style="color:#e74c3c;">rejected</b>.</p>
             <p>Total Period: <b>${application.period} day${application.period > 1 ? "s" : ""}</b></p>`
          : `<p>Your permission request has been <b style="color:#e74c3c;">rejected</b>.</p>
             <p>Date: <b>${application.date}</b></p>
             <p>Time: <b>${application.time}</b></p>
             <p>Duration: <b>${application.hours} hour(s)</b></p>`
      }

      <p style="margin-top: 20px; font-size: 13px; color: #7f8c8d;">
        This is an automated notification from the Leave Management System.
      </p>
    </div>
  </div>
`;


    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-mail`, {
      to: application.email,
      subject: "❌ Leave Application Rejected",
      html,
    });

     const url = `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?status=rejected`;
  return NextResponse.redirect(url);
    
  } catch (err) {
    console.error("Rejection Error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
