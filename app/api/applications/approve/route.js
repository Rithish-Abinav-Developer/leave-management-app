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

    // Update application status
    const application = await Application.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true }
    );

    if (!application) throw new Error("Application not found");

    // Send email to employee
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f7f9fc; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #27ae60;">✅ Your Leave Application Has Been Approved</h2>
          <p>Dear <strong>${application.name}</strong>,</p>
          <p>Your leave application for <strong>${application.leaveType}</strong> from 
          <b>${application.date}</b> ${
            application.toDate ? `to <b>${application.toDate}</b>` : ""
          } has been <b style="color:#27ae60;">approved</b>.</p>

          <p style="margin-top: 20px; font-size: 13px; color: #7f8c8d;">
            This is an automated notification from the Leave Management System.
          </p>
        </div>
      </div>
    `;

    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-mail`, {
      to: application.email,
      subject: "✅ Leave Application Approved",
      html,
    });

    // Redirect to thank-you page
   return NextResponse.json({
  success: true,
  message: "Application approved successfully! Redirect would go to thank-you page.",
  redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?status=approved`,
});

  } catch (err) {
    console.error("Approval Error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
