import { NextResponse } from "next/server";
import { getAccountByRiotId, getMatch, getMatchIds, regionToGroup } from "@/lib/riot";
import { extractRowFromMatch, summarizeRows } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";


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

    await prisma.player.upsert({
      where: { puuid: account.puuid },
      update: { region, gameName, tagLine },
      create: { puuid: account.puuid, region, gameName, tagLine },
    });

    // 2) PUUID -> match IDs
    const matchIds = await getMatchIds(regionGroup, account.puuid, count);

    // 3) match IDs -> match JSONs
    const matches = await mapWithConcurrency(matchIds, 3, async (matchId) => {
      // Try DB first
      const existing = await prisma.match.findUnique({
        where: { matchId },
        select: { rawJson: true },
      });

      if (existing) {
        return existing.rawJson;
      }

      // Otherwise fetch from Riot
      const matchJson = await getMatch(regionGroup, matchId);

      // Store match + link to player
      // Store or update match safely
      await prisma.match.upsert({
        where: { matchId },
        update: {
          regionGroup,
          gameCreation: BigInt(matchJson?.info?.gameCreation ?? 0),
          gameVersion: matchJson?.info?.gameVersion ?? null,
          queueId: matchJson?.info?.queueId ?? null,
          rawJson: matchJson,
        },
        create: {
          matchId,
          regionGroup,
          gameCreation: BigInt(matchJson?.info?.gameCreation ?? 0),
          gameVersion: matchJson?.info?.gameVersion ?? null,
          queueId: matchJson?.info?.queueId ?? null,
          rawJson: matchJson,
        },
      });

      // Ensure player-match relationship exists
      await prisma.playerMatch.upsert({
        where: {
          puuid_matchId: {
            puuid: account.puuid,
            matchId,
          },
        },
        update: {},
        create: {
          puuid: account.puuid,
          matchId,
        },
      });

      return matchJson;
    });

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
