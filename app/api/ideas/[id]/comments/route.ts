import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const newComment = {
      ideaId: id,
      content,
      userId: token.email,
      userName: token.name || "Anonymous",
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
