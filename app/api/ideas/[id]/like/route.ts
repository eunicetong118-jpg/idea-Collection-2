import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = token.email;
  try {
    const db = await getDb();

    const idea = await db.collection("ideas").findOne({ _id: new ObjectId(id) });
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const likes = idea.likes || [];
    const hasLiked = likes.includes(userEmail);

    if (hasLiked) {
      // Unlike
      await db.collection("ideas").updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { likes: userEmail } as any,
          $set: { lastActivityAt: new Date() }
        }
      );
    } else {
      // Like
      await db.collection("ideas").updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: { likes: userEmail } as any,
          $set: { lastActivityAt: new Date() }
        }
      );
    }

    return NextResponse.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
