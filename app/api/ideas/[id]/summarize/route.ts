import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "../../../../../lib/mongodb";
import { generateSummary } from "@/lib/ai/summarize";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDb();

    const idea = await db.collection("ideas").findOne({ _id: new ObjectId(id) });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const contentToSummarize = idea.problem && idea.solution
      ? `${idea.problem}\n${idea.solution}`
      : (idea.problem || idea.description || "");

    const summary = await generateSummary(idea.title, contentToSummarize);

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
