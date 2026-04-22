// src/utils/formatError.ts
//
// Translate opaque on-chain / wallet errors into Indonesian-friendly
// messages so players know exactly what's wrong.

export function formatGambaError(err: any): string {
  const msg: string = (err?.message || err?.toString?.() || "").toLowerCase();
  const logs: string[] = Array.isArray(err?.logs) ? err.logs : [];
  const haystack = [msg, ...logs.map((l) => l.toLowerCase())].join(" ");

  // User-cancelled
  if (
    haystack.includes("user rejected") ||
    haystack.includes("user denied") ||
    haystack.includes("transaction was rejected") ||
    haystack.includes("cancelled")
  ) {
    return "Transaksi dibatalkan oleh kamu.";
  }

  // Insufficient balance
  if (
    haystack.includes("insufficient") ||
    haystack.includes("0x1") ||
    haystack.includes("debit an account but found no record") ||
    haystack.includes("custom program error: 0x1") ||
    haystack.includes("attempt to debit") ||
    haystack.includes("not enough lamports") ||
    haystack.includes("not enough balance")
  ) {
    return "Saldo SOL kamu tidak cukup untuk bet ini (plus gas fee ~0.0001 SOL).";
  }

  // Blockhash / expired
  if (
    haystack.includes("blockhash not found") ||
    haystack.includes("transaction was not confirmed") ||
    haystack.includes("block height exceeded")
  ) {
    return "Transaksi expired. Coba spin lagi.";
  }

  // Rate limit / RPC
  if (
    haystack.includes("429") ||
    haystack.includes("rate limit") ||
    haystack.includes("too many requests")
  ) {
    return "Server lagi sibuk. Tunggu 5 detik, coba lagi.";
  }

  // Wallet not connected
  if (haystack.includes("wallet not connected") || haystack.includes("no wallet")) {
    return "Wallet belum connect. Klik Connect Wallet dulu.";
  }

  // Pool / liquidity issues
  if (
    haystack.includes("pool") &&
    (haystack.includes("insufficient") || haystack.includes("liquidity"))
  ) {
    return "Liquidity pool lagi kurang. Coba bet lebih kecil atau tunggu sebentar.";
  }

  // Network / timeout
  if (
    haystack.includes("failed to fetch") ||
    haystack.includes("network") ||
    haystack.includes("timeout")
  ) {
    return "Koneksi jaringan bermasalah. Cek internet kamu & coba lagi.";
  }

  // Fallback: show original message if any, else generic
  const raw = err?.message || "Unknown error";
  return `Gagal memproses bet: ${raw}`;
}
