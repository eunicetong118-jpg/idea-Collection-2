import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await clientPromise;
    const db = client.db();

    const comments = await db.collection("comments")
      .find({ ideaId: id })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const newComment = {
      ideaId: id,
      content,
      userId: session.user.email,
      userName: session.user.name,
      createdAt: new Date(),
    };

    await db.collection("comments").insertOne(newComment);

    // Update commentCount and lastActivityAt in ideas collection
    await db.collection("ideas").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { commentCount: 1 },
        $set: { lastActivityAt: new Date() }
      }
    );

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
