"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function parseRiotId(input: string): { gameName: string; tagLine: string } | null {
  const trimmed = input.trim();

  // Must look like "name#tag"
  const match = trimmed.match(/^(.+?)#(.+)$/);
  if (!match) return null;

  const gameName = match[1].trim();
  const tagLine = match[2].trim();

  if (!gameName || !tagLine) return null;
  if (gameName.toLowerCase() === "undefined" || tagLine.toLowerCase() === "undefined") return null;

  return { gameName, tagLine };
}

export default function Home() {
  const router = useRouter();

  const [region, setRegion] = useState("EUW1");
  const [riotId, setRiotId] = useState("murkel#0000");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseRiotId(riotId);
    if (!parsed) {
      alert('Please enter Riot ID like: Name#TAG (example: murkel#0000)');
      return;
    }

    const { gameName, tagLine } = parsed;

    router.push(
      `/summoner/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
  }

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">LoL Summoner Dashboard</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm opacity-80">Region</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="EUW1">EUW</option>
            <option value="EUN1">EUNE</option>
            <option value="NA1">NA</option>
            <option value="KR">KR</option>
            <option value="JP1">JP</option>
            <option value="OC1">OCE</option>
            <option value="BR1">BR</option>
            <option value="LA1">LAN</option>
            <option value="LA2">LAS</option>
            <option value="TR1">TR</option>
            <option value="RU">RU</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm opacity-80">Riot ID</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="murkel#0000"
            autoComplete="off"
          />
        </div>

        <button className="border rounded px-4 py-2">View dashboard</button>
      </form>
    </main>
  );
}
