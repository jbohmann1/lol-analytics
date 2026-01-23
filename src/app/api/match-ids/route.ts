import { NextResponse } from "next/server";
import { getMatchIds } from "@/lib/riot";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const regionGroup = searchParams.get("regionGroup"); // EUROPE
  const puuid = searchParams.get("puuid");
  const count = Number(searchParams.get("count") ?? "20");

  if (!regionGroup || !puuid) {
    return NextResponse.json(
      { error: "Missing regionGroup or puuid" },
      { status: 400 }
    );
  }

  if (!["EUROPE", "AMERICAS", "ASIA"].includes(regionGroup)) {
    return NextResponse.json(
      { error: "regionGroup must be EUROPE, AMERICAS, or ASIA" },
      { status: 400 }
    );
  }

  try {
    const matchIds = await getMatchIds(regionGroup as any, puuid, count);
    return NextResponse.json({ puuid, regionGroup, count, matchIds });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
