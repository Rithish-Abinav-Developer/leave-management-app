import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo"; 
import User from "@/models/Users";
import Application from "@/models/Application";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    await connectMongo(); 

    const formData = await request.formData();
    const file = formData.get("file");
    const userName = formData.get("name");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!userName) {
      return NextResponse.json({ error: "Missing user name" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    const updatedUser = await User.findOneAndUpdate(
       { name: userName },             
  { $set: { profileImage: fileUrl } }, 
  { new: true }
    );

    const updatedApplication = await Application.updateMany(
  { name: userName },             
  { $set: { profileImage: fileUrl } }, 
  { new: true }
);



    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Uploaded and profile updated successfully!",
      url: fileUrl,
      user: updatedUser,
    });



  } catch (error) {
    console.error("Error uploading:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
