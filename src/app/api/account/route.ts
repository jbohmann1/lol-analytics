import { NextResponse } from "next/server";
import { getAccountByRiotId, regionToGroup } from "@/lib/riot";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const region = searchParams.get("region");    // e.g. EUW1
  const gameName = searchParams.get("gameName"); // e.g. SomeName
  const tagLine = searchParams.get("tagLine");   // e.g. EUW

  if (!region || !gameName || !tagLine) {
    return NextResponse.json(
      { error: "Missing region, gameName, or tagLine" },
      { status: 400 }
    );
  }

  try {
    const regionGroup = regionToGroup(region);
    const account = await getAccountByRiotId(regionGroup, gameName, tagLine);

    return NextResponse.json({
      region,
      regionGroup,
      ...account, // includes puuid (the important part)
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
