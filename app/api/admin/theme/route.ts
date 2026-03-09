import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongodb";

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
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Re-calculate isAdmin from token (logic from lib/auth.ts)
    const email = token?.email || "";
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
    const isAdmin = adminEmails.includes(email);

    if (!token || !isAdmin) {
      console.error("POST Unauthorized: Token:", !!token, "isAdmin:", isAdmin);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
