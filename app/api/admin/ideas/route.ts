import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Basic admin check - in a real app this would be more robust
  if (!session || !session.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const ideas = await db.collection("ideas")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id to id for the frontend
    const mappedIdeas = ideas.map(idea => ({
      ...idea,
      id: idea._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(mappedIdeas);
  } catch (error) {
    console.error("Error fetching admin ideas:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}
