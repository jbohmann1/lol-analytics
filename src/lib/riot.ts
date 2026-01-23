import { z } from "zod";

/**
 * This file contains ALL Riot API helper functions.
 * Other parts of the app will import from here.
 */

const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
  throw new Error("Missing RIOT_API_KEY in .env.local");
}

/**
 * Riot uses "region groups" for Account + Match APIs
 */
export type RegionGroup = "EUROPE" | "AMERICAS" | "ASIA";

export function regionToGroup(region: string): RegionGroup {
  if (["EUW1", "EUN1", "TR1", "RU"].includes(region)) return "EUROPE";
  if (["NA1", "BR1", "LA1", "LA2"].includes(region)) return "AMERICAS";
  return "ASIA";
}

/**
 * Generic helper to call Riot API safely
 */
async function riotFetch<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY!,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Riot API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return schema.parse(json);
}

/* ================================
   Riot ID → Account (PUUID)
   ================================ */

const AccountSchema = z.object({
  puuid: z.string(),
  gameName: z.string().optional(),
  tagLine: z.string().optional(),
});

export async function getAccountByRiotId(
  regionGroup: RegionGroup,
  gameName: string,
  tagLine: string
) {
  const url =
    `https://${regionGroup}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
    `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  return riotFetch(url, AccountSchema);
}

/* ================================
   PUUID → Match IDs
   ================================ */

const MatchIdsSchema = z.array(z.string());

export async function getMatchIds(
  regionGroup: RegionGroup,
  puuid: string,
  count = 20
) {
  const url =
    `https://${regionGroup}.api.riotgames.com/lol/match/v5/matches/by-puuid/` +
    `${encodeURIComponent(puuid)}/ids?start=0&count=${count}`;

  return riotFetch(url, MatchIdsSchema);
}

export async function getMatch(regionGroup: RegionGroup, matchId: string) {
  const url =
    `https://${regionGroup}.api.riotgames.com/lol/match/v5/matches/` +
    encodeURIComponent(matchId);

  const res = await fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY! },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Riot API error ${res.status}: ${body}`);
  }

  return res.json();
}