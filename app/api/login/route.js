import User from "@/models/Users";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongo();
  const users = await User.find();
  return NextResponse.json({ users }, { status: 200 });
}

export async function POST(req) {
  await connectMongo();

  const { email, password } = await req.json();
  // console.log(email, password);

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await User.findOne({ email });
  console.log("User found:", user);

  if (!user) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (user.password !== password) {
    return NextResponse.json({ error: "Password not match" }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Login successful", user: { name: user.name,email:user.email,division:user.division, role: user.role,id:user.id,profileImage:user.profileImage } },
    { status: 200 }
  );
}
