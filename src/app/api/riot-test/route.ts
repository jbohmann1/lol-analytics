import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.RIOT_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing RIOT_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  // Simple Riot endpoint that doesn't require a summoner name.
  // It should return platform status info if your key works.
  const url = "https://euw1.api.riotgames.com/lol/status/v4/platform-data";

  const res = await fetch(url, {
    headers: { "X-Riot-Token": key },
  });

  const text = await res.text();

  // Return the status code + response body so we can debug easily.
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
