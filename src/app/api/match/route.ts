import { NextResponse } from "next/server";
import { getMatch } from "@/lib/riot";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const regionGroup = searchParams.get("regionGroup");
  const matchId = searchParams.get("matchId");

  if (!regionGroup || !matchId) {
    return NextResponse.json(
      { error: "Missing regionGroup or matchId" },
      { status: 400 }
    );
  }

  try {
    const match = await getMatch(regionGroup as any, matchId);
    return NextResponse.json(match);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
