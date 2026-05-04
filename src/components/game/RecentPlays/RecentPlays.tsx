// src/components/game/RecentPlays/RecentPlays.tsx
import { useEffect, useState } from "react";
import {
  generateDemoPlay,
  generateInitialDemoPlays,
  formatSol,
  shortenAddress,
  timeAgo,
  type DemoPlay,
} from "@/utils/demoFeed";
import { useRecentPlays } from "../../../hooks/useRecentPlays";

const GAME_EMOJI: Record<string, string> = {
  Dice: "🎲",
  Flip: "🪙",
  Slots: "🎰",
  Crash: "🚀",
  Limbo: "🧊",
  Mines: "💣",
  Plinko: "🎯",
  HiLo: "🃏",
  Roulette: "🎡",
  Keno: "🔢",
};

type FeedRow = {
  id: string;
  time: number;
  game: string;
  user: string;
  wagerLamports: number;
  payoutLamports: number;
  multiplier: number;
  won: boolean;
  isDemo: boolean;
};

function realToRow(tx: any): FeedRow {
  // Gamba GameSettled transaction shape
  const data = tx.data;
  return {
    id: tx.signature,
    time: tx.time,
    game: tx.game?.name || data.metadata?.[0] || "Game",
    user: data.user?.toBase58?.() ?? String(data.user ?? ""),
    wagerLamports: Number(data.wager ?? 0),
    payoutLamports: Number(data.payout ?? 0),
    multiplier: Number(data.multiplierResult ?? data.multiplier ?? 0) / 10000,
    won: Number(data.payout ?? 0) > Number(data.wager ?? 0),
    isDemo: false,
  };
}

function demoToRow(p: DemoPlay): FeedRow {
  return {
    id: p.signature,
    time: p.time,
    game: p.data.game,
    user: p.data.user,
    wagerLamports: p.data.wager,
    payoutLamports: p.data.payout,
    multiplier: p.data.multiplier,
    won: p.data.won,
    isDemo: true,
  };
}

export default function RecentPlays() {
  // Pull real on-chain plays (gracefully empty if RPC throttles)
  const realEvents = useRecentPlays(false);

  // Seed an initial demo feed so the panel looks alive immediately
  const [demoPlays, setDemoPlays] = useState<DemoPlay[]>(() =>
    generateInitialDemoPlays(12)
  );

  // Append a fresh demo play every 2-7 seconds so the feed feels live
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setDemoPlays((prev) => [generateDemoPlay(0), ...prev].slice(0, 25));
      const next = 2000 + Math.random() * 5000;
      setTimeout(tick, next);
    };
    const id = setTimeout(tick, 2000 + Math.random() * 4000);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, []);

  // Force re-render every second so "X seconds ago" timestamps update
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Merge: real plays always win priority. Show up to 12 rows.
  const rows: FeedRow[] = [
    ...realEvents.map(realToRow),
    ...demoPlays.map(demoToRow),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 12);

  return (
    <div className="w-full relative flex flex-col gap-1.5">
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0f121b] hover:bg-[#131724] transition-colors animate-fade-in"
        >
          <span className="text-2xl">{GAME_EMOJI[r.game] ?? "🎰"}</span>

          <div className="flex flex-col flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">{r.game}</span>
              <span className="text-white/50 font-mono text-xs">
                {shortenAddress(r.user)}
              </span>
            </div>
            <div className="text-xs text-white/60">
              {formatSol(r.wagerLamports)} ·{" "}
              {r.won ? (
                <span className="text-lime-400 font-semibold">
                  +{formatSol(r.payoutLamports - r.wagerLamports)} ({r.multiplier.toFixed(2)}×)
                </span>
              ) : (
                <span className="text-rose-400">
                  -{formatSol(r.wagerLamports)}
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-white/40 whitespace-nowrap">
            {timeAgo(r.time)}
          </span>
        </div>
      ))}
    </div>
  );
}
