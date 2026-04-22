// src/pages/api/rpc.ts
//
// Server-side proxy to Solana RPC. Browsers get blocked by public
// Solana RPC endpoints (403), but server-to-server calls work fine.
// The frontend points NEXT_PUBLIC_RPC_ENDPOINT at /api/rpc, this route
// forwards the JSON-RPC body to whichever upstream we configure.
//
// No API key needed, no rate limits from provider-side CORS checks,
// unlimited casino traffic as long as Vercel quota holds.

import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM =
  process.env.SOLANA_RPC_UPSTREAM || "https://api.mainnet-beta.solana.com";

export const config = {
  api: {
    // Allow up to 1 MB bodies (batch RPC calls can be big)
    bodyParser: { sizeLimit: "1mb" },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS for browser clients (Phantom in-app browser, etc.)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const upstreamRes = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
    });

    const data = await upstreamRes.text();
    res
      .status(upstreamRes.status)
      .setHeader(
        "Content-Type",
        upstreamRes.headers.get("content-type") || "application/json"
      )
      .send(data);
  } catch (err: any) {
    console.error("[RPC proxy] upstream error:", err?.message);
    res.status(502).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: `Upstream fetch failed: ${err?.message}` },
      id: null,
    });
  }
}
