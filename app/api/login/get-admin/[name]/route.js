import User from "@/models/Users";
import connectMongo from "@/utils/connectMongo";
import { NextResponse } from "next/server";

export async function GET(req,{params}) {
   const { name } = await params;
  await connectMongo();
  const users = await User.find({admin:name});
  return NextResponse.json({ users }, { status: 200 });
}