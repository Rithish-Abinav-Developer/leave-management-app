import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Application from "@/models/Application";
import Users from "@/models/Users";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    await connectMongo();

    const formData = await req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");
    const division = formData.get("division");
    const admin = formData.get("admin");
    const type = formData.get("type");
    const leaveType = formData.get("leaveType");
    const date = formData.get("date");
    const fromPeriod = formData.get("fromPeriod");
    const toPeriod = formData.get("toPeriod");
    const time = formData.get("time");
    const hours = formData.get("hours");
    const period = formData.get("period");
    const reason = formData.get("reason");
    const status = formData.get("status");
    const file = formData.get("file");
    const userId = formData.get("userId");
    const toDate = formData.get("toDate");
    const profileImage = formData.get("profileImage");

    let fileUrl = null;

  
    if (file && file.size > 0 && file.type) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

   
    const application = new Application({
      name,
      email,
      role,
      division,
      admin,
      type,
      leaveType,
      date,
      fromPeriod,
      toPeriod,
      time,
      hours,
      period,
      reason,
      fileUrl,
      status,
      userId,
      toDate,
      profileImage,
    });

    await application.save();

   
    const applicationAdmin = await Users.find({ name: admin });
    console.log(applicationAdmin);
    if (!applicationAdmin.length) {
      throw new Error(`No admin found with name: ${admin}`);
    }

  
  
   const subject = `Leave Application Submitted by ${name} (${type === "Leave" ? leaveType : type})`;



    const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/approve?id=${application._id}`;
    const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/reject?id=${application._id}`;

  const html = `
<div style="font-family: Arial, sans-serif; background: #f7f9fc; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="color: #2c3e50;">
      ${type === "Leave" ? "New Leave Application Received" : "New Permission Request Received"}
    </h2>

    <p style="font-size: 15px;">Dear ${admin},</p>
    <p style="font-size: 15px;">
      Employee <strong>${name}</strong> has submitted a new <strong>${type}</strong> application.
      Please review the details below:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Employee Name</td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Role</td><td style="padding: 8px; border: 1px solid #ddd;">${role}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Division</td><td style="padding: 8px; border: 1px solid #ddd;">${division}</td></tr>

      ${
        type === "Leave"
          ? `
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Leave Type</td><td style="padding: 8px; border: 1px solid #ddd;">${leaveType}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">From</td><td style="padding: 8px; border: 1px solid #ddd;">
        ${date}${fromPeriod == 0.5 ? " (Half Day)" : ""}
      </td></tr>
      ${
        toDate
          ? `<tr><td style="padding: 8px; border: 1px solid #ddd;">To</td><td style="padding: 8px; border: 1px solid #ddd;">
            ${toDate}${toPeriod == 0.5 ? " (Half Day)" : ""}
          </td></tr>`
          : ""
      }
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Period</td><td style="padding: 8px; border: 1px solid #ddd;">${period} Day(s)</td></tr>
      `
          : `
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Date</td><td style="padding: 8px; border: 1px solid #ddd;">${date}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Time</td><td style="padding: 8px; border: 1px solid #ddd;">${time}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;">Hours</td><td style="padding: 8px; border: 1px solid #ddd;">${hours}</td></tr>
      `
      }

      <tr><td style="padding: 8px; border: 1px solid #ddd;">Reason</td><td style="padding: 8px; border: 1px solid #ddd;">${reason}</td></tr>
    </table>

    ${
      fileUrl
        ? `<p style="margin-top: 16px;">📎 <a href="${fileUrl}" target="_blank" style="color: #2980b9; text-decoration: none;">View Attached Document</a></p>`
        : ""
    }

    <div style="margin-top: 24px; text-align: center;">
      <a href="${approveLink}" 
        style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-right: 10px; font-weight: bold;">
        ✅ Approve
      </a>
      <a href="${rejectLink}" 
        style="display: inline-block; background-color: #e74c3c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        ❌ Reject
      </a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #7f8c8d; text-align: center;">
      This is an automated message from the Leave Management System.
    </p>
  </div>
</div>
`;



 await axios.post(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-mail`,
  {
    from: `"${name}" <${email}>`,
    replyTo: `"${name}" <${email}>`, 
    to: applicationAdmin[0].email,
    subject,
    html,
  }
);


    return NextResponse.json({
      success: true,
      message: "Application saved, file uploaded, and email sent successfully!",
      fileUrl,
    });
  } catch (err) {
    console.error("Error saving application:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin");

    const query = admin ? { admin } : {};
    const userApplications = await Application.find(query);

    return NextResponse.json({ success: true, userApplications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
