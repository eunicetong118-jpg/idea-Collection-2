import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { checkSimilarity, generateEmbedding } from "@/lib/ai/similarity";
import { generateSummary } from "@/lib/ai/summarize";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subTopicId = searchParams.get("subTopicId");

    if (!subTopicId) {
      return NextResponse.json({ error: "subTopicId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ideas = await db.collection("ideas")
      .find({ subTopicId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, subTopicId, force } = await request.json();

    if (!title || !description || !subTopicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Combine title and description for similarity check
    const combinedText = `${title}\n${description}`;

    // If not forced (user hasn't confirmed after a similarity warning), check similarity
    if (!force) {
      const similarIdea = await checkSimilarity(combinedText);
      if (similarIdea) {
        return NextResponse.json({
          error: "Similar idea exists",
          similarIdea: {
            title: similarIdea.title,
            description: similarIdea.description,
            score: similarIdea.score
          }
        }, { status: 409 });
      }
    }

    // Generate embedding for the new idea
    const embedding = await generateEmbedding(combinedText);
    // Generate summary for the new idea
    const summary = await generateSummary(title, description);

    const client = await clientPromise;
    const db = client.db();

    const newIdea = {
      title,
      description,
      subTopicId,
      userId: session.user.email,
      userName: session.user.name,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      embedding: embedding,
      summary: summary,
      stage: "Idea",
      stage_status: "Pending",
      likes: [],
      commentCount: 0
    };

    const result = await db.collection("ideas").insertOne(newIdea);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error submitting idea:", error);
    return NextResponse.json({ error: "Failed to submit idea" }, { status: 500 });
  }
}
