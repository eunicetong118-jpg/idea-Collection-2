import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.isAdmin === true;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const theme = await db.collection("themes").findOne({ active: true });
    return NextResponse.json(theme || { title: "" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Ensure only one active theme
    await db.collection("themes").updateMany({}, { $set: { active: false } });

    const result = await db.collection("themes").updateOne(
      { active: true },
      { $set: { title, active: true, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
