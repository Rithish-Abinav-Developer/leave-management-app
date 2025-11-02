// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { NextResponse } from "next/server";


// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });


// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const fileName = `${Date.now()}-${file.name}`;

//     const uploadParams = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: fileName,
//       Body: buffer,
//       ContentType: file.type,
//     };

//     await s3.send(new PutObjectCommand(uploadParams));

//     const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

//     return NextResponse.json({ message: "Uploaded successfully!", url: fileUrl });
//   } catch (error) {
//     console.error("Error uploading:", error);
//     return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
//   }
// }
