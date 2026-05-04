// src/utils/demoFeed.ts
//
// Generates realistic-looking demo plays so the Recent Plays panel never
// looks empty. Real on-chain events are merged in by the hook — demo
// rows decay out as real ones arrive.

const GAMES = [
  { id: "dice", name: "Dice" },
  { id: "flip", name: "Flip" },
  { id: "slots", name: "Slots" },
  { id: "crash", name: "Crash" },
  { id: "limbo", name: "Limbo" },
  { id: "mines", name: "Mines" },
  { id: "plinko", name: "Plinko" },
  { id: "hilo", name: "HiLo" },
  { id: "roulette", name: "Roulette" },
  { id: "keno", name: "Keno" },
];

const SOL_DECIMALS = 9;
const LAMPORTS_PER_SOL = 1_000_000_000;

function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBase58(length = 44) {
  const chars =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export type DemoPlay = {
  signature: string;
  isDemo: true;
  time: number; // ms epoch
  data: {
    game: string;
    user: string;
    creator: string;
    wager: number; // lamports
    payout: number; // lamports
    multiplier: number;
    won: boolean;
  };
};

/**
 * Generate one realistic-looking play with weighted distribution that
 * mirrors a typical Solana casino — most bets small, occasional big wins.
 */
export function generateDemoPlay(timeOffsetMs = 0): DemoPlay {
  const game = randPick(GAMES);

  // Bet distribution: mostly tiny (degens spam micro bets), occasionally bigger
  const r = Math.random();
  let wagerSol: number;
  if (r < 0.7) wagerSol = +(0.001 + Math.random() * 0.05).toFixed(4); // 0.001 - 0.05 SOL
  else if (r < 0.95) wagerSol = +(0.05 + Math.random() * 0.5).toFixed(3); // 0.05 - 0.5 SOL
  else wagerSol = +(0.5 + Math.random() * 5).toFixed(2); // 0.5 - 5 SOL whales

  // Win chance ~40-48% (house edge on top of 50/50 baseline games)
  const won = Math.random() < 0.45;
  let multiplier = 0;
  let payout = 0;

  if (won) {
    // Multiplier distribution: usually 1.5x-3x, sometimes big hits
    const m = Math.random();
    if (m < 0.6) multiplier = +(1.2 + Math.random() * 1.8).toFixed(2); // 1.2-3x
    else if (m < 0.9) multiplier = +(3 + Math.random() * 7).toFixed(2); // 3-10x
    else multiplier = +(10 + Math.random() * 90).toFixed(2); // 10-100x mega win
    payout = +(wagerSol * multiplier).toFixed(4);
  }

  return {
    signature: randomBase58(64),
    isDemo: true,
    time: Date.now() - timeOffsetMs,
    data: {
      game: game.name,
      user: randomBase58(44),
      creator: randomBase58(44),
      wager: Math.round(wagerSol * LAMPORTS_PER_SOL),
      payout: Math.round(payout * LAMPORTS_PER_SOL),
      multiplier,
      won,
    },
  };
}

/**
 * Generate a starter list of plays at varied historical timestamps so
 * the feed looks like it's been active for a while.
 */
export function generateInitialDemoPlays(count = 12): DemoPlay[] {
  const plays: DemoPlay[] = [];
  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    // Each successive play is 3-30s older than the previous
    cumulative += randInt(3000, 30000);
    plays.push(generateDemoPlay(cumulative));
  }
  return plays;
}

/**
 * Format lamports → "0.42 SOL" string for display.
 */
export function formatSol(lamports: number): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  if (sol >= 1) return `${sol.toFixed(2)} SOL`;
  if (sol >= 0.01) return `${sol.toFixed(3)} SOL`;
  return `${sol.toFixed(4)} SOL`;
}

export function shortenAddress(addr: string, len = 4): string {
  if (addr.length <= len * 2 + 3) return addr;
  return `${addr.slice(0, len)}…${addr.slice(-len)}`;
}

export function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
