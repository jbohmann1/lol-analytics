import { headers } from "next/headers";

type DashboardResponse = {
  account: { puuid: string; gameName: string; tagLine: string };
  summary: {
    games: number;
    wins: number;
    winrate: number;
    avgK: number;
    avgD: number;
    avgA: number;
    avgCsPerMin: number;
    avgVisionPerMin: number;
    topChamps: { name: string; count: number }[];
    roles: { role: string; count: number }[];
  };
  rows: {
    matchId: string;
    win: boolean;
    championName: string;
    teamPosition: string;
    kills: number;
    deaths: number;
    assists: number;
    csPerMin: number;
    visionPerMin: number;
    durationMin: number;
  }[];
  error?: string;
};

function champIconUrl(champName: string) {
  // Uses latest “cdn” style; most champName values match.
  // Some edge cases exist (e.g. "Wukong" vs "MonkeyKing")—we can fix later.
  const patch = "14.1.1"; // later: fetch latest dynamically
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champName}.png`;
}

export default async function SummonerPage({
  params,
}: {
  // 👇 IMPORTANT: params is a Promise on your Next.js version
  params: Promise<{ region: string; gameName: string; tagLine: string }>;
}) {
  const { region, gameName, tagLine } = await params; // ✅ FIX

  const h = await headers();
  const host = h.get("host"); // e.g. localhost:3000
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";

  const url = `${proto}://${host}/api/dashboard?region=${encodeURIComponent(
    region
  )}&gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(
    tagLine
  )}&count=10`;

  const res = await fetch(url, { cache: "no-store" });

  const data = (await res.json()) as DashboardResponse;

  if (!res.ok || data.error) {
    return (
      <div className="p-8">
        <div className="text-xl font-semibold">Error</div>
        <pre className="mt-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  const s = data.summary;

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {gameName}#{tagLine}
        </h1>
        <div className="text-sm opacity-70">
          {region} • last {s.games} games
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Winrate" value={`${Math.round(s.winrate * 100)}%`} />
        <Stat label="Avg K/D/A" value={`${s.avgK.toFixed(1)}/${s.avgD.toFixed(1)}/${s.avgA.toFixed(1)}`} />
        <Stat label="CS/min" value={s.avgCsPerMin.toFixed(1)} />
        <Stat label="Vision/min" value={s.avgVisionPerMin.toFixed(2)} />
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Top Champions</div>
          <div className="space-y-1 text-sm">
            {s.topChamps.map(c => (
              <div key={c.name} className="flex justify-between">
                <span>{c.name}</span>
                <span className="opacity-70">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Roles</div>
          <div className="space-y-1 text-sm">
            {s.roles.map(r => (
              <div key={r.role} className="flex justify-between">
                <span>{r.role}</span>
                <span className="opacity-70">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Matches</h2>

        <div className="space-y-2">
          {data.rows.map((r) => (
            <div key={r.matchId}
              className={`border rounded-lg p-3 flex items-center justify-between
                ${r.win ? "border-green-700/40 bg-green-950/20" : "border-red-700/40 bg-red-950/20"}
              `}
            >
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <img
                    src={champIconUrl(r.championName)}
                    alt={r.championName}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span>
                    {r.championName} • {r.teamPosition || "UNKNOWN"}
                  </span>
                </div>
                <div className="text-sm opacity-70">
                  {r.kills}/{r.deaths}/{r.assists} •{" "}
                  {((r.kills + r.assists) / Math.max(1, r.deaths)).toFixed(2)} KDA •{" "}
                  {r.csPerMin.toFixed(1)} CS/min •{" "}
                  {r.durationMin.toFixed(0)}m
                </div>
              </div>

              <div className={r.win ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                {r.win ? "W" : "L"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}