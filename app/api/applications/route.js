import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Application from "@/models/Application";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
    const type = formData.get("type");
    const leaveType = formData.get("leaveType");
    const date = formData.get("date");
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
      type,
      leaveType,
      date,
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

    return NextResponse.json({
      success: true,
      message: "Application saved and file uploaded successfully!",
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

    const userApplications = await Application.find();

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
