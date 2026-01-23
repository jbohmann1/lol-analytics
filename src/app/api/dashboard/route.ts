import { NextResponse } from "next/server";
import { getAccountByRiotId, getMatch, getMatchIds, regionToGroup } from "@/lib/riot";
import { extractRowFromMatch, summarizeRows } from "@/lib/analytics";

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const region = searchParams.get("region");     // EUW1
  const gameName = searchParams.get("gameName"); // murkel
  const tagLine = searchParams.get("tagLine");   // 0000

  const count = Math.min(Number(searchParams.get("count") ?? "10"), 10); // Rate Limit Reduction

  if (!region || !gameName || !tagLine) {
    return NextResponse.json(
      { error: "Missing region, gameName, or tagLine" },
      { status: 400 }
    );
  }

  try {
    const regionGroup = regionToGroup(region);

    // 1) Riot ID -> PUUID
    const account = await getAccountByRiotId(regionGroup, gameName, tagLine);

    // 2) PUUID -> match IDs
    const matchIds = await getMatchIds(regionGroup, account.puuid, count);

    // 3) match IDs -> match JSONs
    const matches = await mapWithConcurrency(
        matchIds,
        3,
        (id) => getMatch(regionGroup, id)
    );

    // 4) match JSONs -> rows (your stats per match)
    const rows = matches
      .map(m => extractRowFromMatch(account.puuid, m))
      .filter(Boolean);

    // 5) rows -> summary
    const summary = summarizeRows(rows as any);

    return NextResponse.json({
      region,
      regionGroup,
      account: {
        puuid: account.puuid,
        gameName,
        tagLine,
      },
      summary,
      rows,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
