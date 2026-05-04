// src/components/game/RecentPlays/RecentPlays.tsx
import { GambaTransaction } from "gamba-core-v2";
import { RecentPlay } from "@/utils/RecentPlay";
import { ShareModal } from "./ShareModal";
import { TimeDiff } from "@/utils/TimeDiff";
import { useRecentPlays } from "../../../hooks/useRecentPlays";
import { useState } from "react";

export default function RecentPlays() {
  // platformOnly=false → show plays from ALL Gamba casinos so the feed is
  // alive from day one. Once we have meaningful own-platform volume we can
  // flip this to true to show only our players.
  const events = useRecentPlays(false);
  const [selectedGame, setSelectedGame] =
    useState<GambaTransaction<"GameSettled"> | null>(null);

  return (
    <div className="w-full relative flex flex-col gap-2.5">
      {selectedGame && (
        <ShareModal
          event={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
      {events.length > 0
        ? events.map((tx, index) => (
            <button
              key={tx.signature + "-" + index}
              onClick={() => setSelectedGame(tx)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0f121b] hover:bg-[#131724] justify-between"
            >
              <div className="flex items-center gap-2">
                <RecentPlay event={tx} />
              </div>
              <TimeDiff time={tx.time} />
            </button>
          ))
        : Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-10 w-full rounded-lg animate-Skeleton bg-gray-300"
            ></div>
          ))}
    </div>
  );
}
