import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.isAdmin === true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subtopics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await request.json();
    const db = await getDb();

    const result = await db.collection("subtopics").insertOne({
      title,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subtopic" }, { status: 500 });
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
