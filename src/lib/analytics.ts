export type MatchRow = {
  matchId: string;
  win: boolean;
  championName: string;
  teamPosition: string; // TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY or ""
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  csPerMin: number;
  visionScore: number;
  visionPerMin: number;
  durationMin: number;
  gameCreation: number;
};

export function extractRowFromMatch(puuid: string, match: any): MatchRow | null {
  const info = match?.info;
  const meta = match?.metadata;
  if (!info || !meta) return null;

  const p = info.participants?.find((x: any) => x.puuid === puuid);
  if (!p) return null;

  const durationMin = (info.gameDuration ?? 0) / 60;
  const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);

  return {
    matchId: meta.matchId,
    win: !!p.win,
    championName: p.championName ?? String(p.championId ?? "Unknown"),
    teamPosition: p.teamPosition ?? "",
    kills: p.kills ?? 0,
    deaths: p.deaths ?? 0,
    assists: p.assists ?? 0,
    cs,
    csPerMin: durationMin > 0 ? cs / durationMin : 0,
    visionScore: p.visionScore ?? 0,
    visionPerMin: durationMin > 0 ? (p.visionScore ?? 0) / durationMin : 0,
    durationMin,
    gameCreation: info.gameCreation ?? 0,
  };
}

export function summarizeRows(rows: MatchRow[]) {
  const games = rows.length;
  const wins = rows.filter(r => r.win).length;

  const avg = (fn: (r: MatchRow) => number) =>
    games ? rows.reduce((s, r) => s + fn(r), 0) / games : 0;

  // Top champions
  const champCounts = new Map<string, number>();
  for (const r of rows) champCounts.set(r.championName, (champCounts.get(r.championName) ?? 0) + 1);

  const topChamps = [...champCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Role distribution
  const roleCounts = new Map<string, number>();
  for (const r of rows) {
    const role = r.teamPosition || "UNKNOWN";
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  const roles = [...roleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([role, count]) => ({ role, count }));

  return {
    games,
    wins,
    winrate: games ? wins / games : 0,
    avgK: avg(r => r.kills),
    avgD: avg(r => r.deaths),
    avgA: avg(r => r.assists),
    avgCsPerMin: avg(r => r.csPerMin),
    avgVisionPerMin: avg(r => r.visionPerMin),
    topChamps,
    roles,
  };
}
