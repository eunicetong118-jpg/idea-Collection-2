import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  console.log("Registration API hit");
  try {
    const body = await request.json();
    console.log("Registration body:", { ...body, password: "[REDACTED]" });
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error("Detailed registration error:", {
      message: error.message,
      stack: error.stack,
      error
    });
    return NextResponse.json({ error: "Failed to register user", details: error.message }, { status: 500 });
  }
}
