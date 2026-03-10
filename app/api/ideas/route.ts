import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/mongodb";
import { checkSimilarity, generateEmbedding } from "@/lib/ai/similarity";
import { generateSummary } from "@/lib/ai/summarize";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subTopicId = searchParams.get("subTopicId");

    if (!subTopicId) {
      return NextResponse.json({ error: "subTopicId is required" }, { status: 400 });
    }

    const db = await getDb();
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
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      problem,
      solution,
      relatedProduct,
      department,
      country,
      additionalBusiness,
      involvement,
      revenue,
      fileBase64,
      subTopicId,
      force
    } = await request.json();

    if (!title || !problem || !solution || !relatedProduct || !department || !country || !additionalBusiness || !involvement || !subTopicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Combine relevant text fields for similarity check
    const combinedText = `${title}\n${problem}\n${solution}\n${relatedProduct}`;

    // If not forced (user hasn't confirmed after a similarity warning), check similarity
    if (!force) {
      const similarIdea = await checkSimilarity(combinedText);
      if (similarIdea) {
        return NextResponse.json({
          error: "Similar idea exists",
          similarIdea: {
            title: similarIdea.title,
            description: similarIdea.description || similarIdea.problem, // fallback to problem if description doesn't exist
            score: similarIdea.score
          }
        }, { status: 409 });
      }
    }

    // Generate embedding for the new idea
    const embedding = await generateEmbedding(combinedText);
    // Generate summary for the new idea (using title and problem/solution)
    const summary = await generateSummary(title, `${problem}\n${solution}`);

    const db = await getDb();

    const newIdea = {
      title,
      problem,
      solution,
      relatedProduct,
      department,
      country,
      additionalBusiness,
      involvement,
      revenue,
      fileBase64,
      subTopicId,
      userId: token.email,
      userName: token.name || "Anonymous",
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
