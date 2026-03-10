import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function checkAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email || "";
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  return !!token && adminEmails.includes(email);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { stage, stage_status } = await request.json();

    if (!stage || !stage_status) {
      return NextResponse.json({ error: "Missing stage or stage_status" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("ideas").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stage,
          stage_status,
          lastActivityAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating idea status:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
