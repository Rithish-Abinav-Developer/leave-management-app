import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {from,replyTo, to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use "smtp" for custom
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your App Password (not regular Gmail password)
      },
       tls: {
    rejectUnauthorized: false, // 👈 allows self-signed certificates
  },
    });

    // Email options
    const mailOptions = {
      from,
      replyTo,
      to,
      subject,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
