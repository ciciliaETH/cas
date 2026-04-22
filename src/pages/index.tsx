// src/pages/index.tsx
import { GameGrid } from "@/components/game/GameGrid";
import { PLATFORM_REFERRAL_FEE } from "@/constants";
import RecentPlays from "@/components/game/RecentPlays/RecentPlays";
import { toast } from "sonner";
import { useReferral } from "gamba-react-ui-v2";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function HomePage() {
  const walletModal = useWalletModal();
  const wallet = useWallet();
  const { copyLinkToClipboard } = useReferral();

  const handleCopyInvite = () => {
    if (!wallet.publicKey) {
      return walletModal.setVisible(true);
    }
    copyLinkToClipboard();
    toast.success(
      `Copied! Share your link to earn a ${PLATFORM_REFERRAL_FEE * 100}% fee when players use this platform`,
    );
  };

  return (
    <>
      <div className="relative mx-auto flex flex-col gap-5 mt-20 pb-10 px-2.5 transition-all duration-250 ease-in-out sm:px-5 sm:pt-5 md:max-w-6xl">
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-lg lg:grid lg:grid-cols-3 gap-4 lg:p-10 bg-transparent">
          <div
            style={{
              backgroundImage:
                "linear-gradient(135deg, #0d0e2a 0%, #1a1744 50%, #2d1b69 100%)",
              zIndex: -1,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "12px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-lime-400/10 to-transparent opacity-30 transform rotate-12 scale-150 blur-xl pointer-events-none"></div>

          <div className="bg-[#15152e]/80 rounded-lg p-6 lg:col-span-2 text-center lg:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                Welcome to{" "}
                <span className="text-lime-400">MEME CASINO</span>{" "}
                🎰
              </h1>
            </div>
            <p className="my-2 text-white drop-shadow">
              Provably fair on-chain casino on Solana. Instant payouts, no KYC.
            </p>
            <p className="my-2 text-sm max-w-sm text-white/70">
              Share your link to earn a {PLATFORM_REFERRAL_FEE * 100}% fee on
              every bet when players use your referral code.
            </p>
            <button
              className="bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-lg px-4 py-2 text-sm transition-all"
              onClick={handleCopyInvite}
            >
              Copy Referral Link
            </button>
          </div>
          <div className="whitespace-nowrap grid grid-cols-1 gap-2 mt-5 md:flex md:flex-col md:mt-0 md:justify-start">
            <button
              onClick={() => (wallet.publicKey ? null : walletModal.setVisible(true))}
              className="rounded-lg p-3 bg-lime-400 hover:bg-lime-300 hover:-translate-y-0.5 transform text-black font-bold transition-all duration-200 ease-in-out cursor-pointer shadow-lg hover:shadow-xl"
            >
              {wallet.publicKey ? "🎲 Start Playing" : "🔗 Connect Wallet"}
            </button>
            <button
              onClick={() => window.open("https://x.com")}
              className="rounded-lg p-3 bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 transform text-white transition-all duration-200 ease-in-out cursor-pointer shadow-lg hover:shadow-xl"
            >
              🐦 Follow on X
            </button>
            <button
              onClick={() => window.open("https://t.me")}
              className="rounded-lg p-3 bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 transform text-white transition-all duration-200 ease-in-out cursor-pointer shadow-lg hover:shadow-xl"
            >
              💬 Join Telegram
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center">Games</h2>
        <GameGrid />
        <h2 className="text-2xl font-bold text-center">Recent Plays</h2>
        <RecentPlays />
      </div>
    </>
  );
}
