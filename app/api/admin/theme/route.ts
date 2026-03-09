import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "../../../../lib/mongodb";

async function checkAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email || "";
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  return !!token && adminEmails.includes(email);
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No Token" }, { status: 401 });
    }

    const db = await getDb();
    const theme = await db.collection("themes").findOne({ type: "main_theme" });
    return NextResponse.json(theme || { title: "" });
  } catch (error: any) {
    console.error("Theme GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch theme" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("themes").updateOne(
      { type: "main_theme" },
      { $set: { title, active: true, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Theme POST error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
