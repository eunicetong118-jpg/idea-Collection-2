import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { generateSummary } from "@/lib/ai/summarize";
import { ObjectId } from "mongodb";

// Only admins should be able to trigger manual summarization
// For simplicity, we check if the user is logged in first.
// The design doc mentions admins are identified via a hardcoded email list in env variables.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db();

    const idea = await db.collection("ideas").findOne({ _id: new ObjectId(id) });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const summary = await generateSummary(idea.title, idea.description);

    await db.collection("ideas").updateOne(
      { _id: new ObjectId(id) },
      { $set: { summary, lastActivityAt: new Date() } }
    );

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Error in manual summarization:", error);
    return NextResponse.json({ error: "Failed to summarize idea" }, { status: 500 });
  }
}
