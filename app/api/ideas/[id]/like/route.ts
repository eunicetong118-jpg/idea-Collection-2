import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;
  if (!userEmail) {
    return NextResponse.json({ error: "User email not found" }, { status: 400 });
  }

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
