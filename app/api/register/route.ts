import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

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
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
