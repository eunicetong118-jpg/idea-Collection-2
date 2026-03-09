import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "../../../../lib/mongodb";

async function checkAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email || "";
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  return !!token && adminEmails.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
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
