import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No Token" }, { status: 401 });
    }

    const db = await getDb();

    // Fetch subtopics
    const subtopics = await db.collection("subtopics").find().toArray();

    // For each subtopic, count cards in "ideas" collection
    const subtopicsWithCounts = await Promise.all(
      subtopics.map(async (st) => {
        const cardCount = await db.collection("ideas").countDocuments({ subTopicId: st._id.toString() });
        return {
          ...st,
          id: st._id.toString(),
          cardCount
        };
      })
    );

    return NextResponse.json(subtopicsWithCounts);
  } catch (error: any) {
    console.error("Subtopics GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch subtopics" }, { status: 500 });
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
      console.error("Subtopics POST Unauthorized: Token:", !!token, "isAdmin:", isAdmin);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("subtopics").insertOne({
      title,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error("Subtopics POST error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title } = await request.json();
    const db = await getDb();

    await db.collection("subtopics").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update subtopic" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const db = await getDb();

    await db.collection("subtopics").deleteOne({ _id: new ObjectId(id) });
    // Note: In a real app, you might want to handle ideas linked to this subtopic

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subtopic" }, { status: 500 });
  }
}
