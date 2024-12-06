import { toSolDecimals } from "./solana/utils";

// // Bot info
export const BOT_NAME = "EzPump";
export const BOT_SERVICE_FEE = toSolDecimals(0.00019);
export const BOT_IMAGE_GIF =
  "https://plum-near-goat-819.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7";
// Bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🎁 FREE token-pass for new users! 🔥 Boost your token at: "www." + "ez" + "pump" + "." + "fun"! 🔥 The simplest, cheapest pump bot for Pump.Fun - just ${BOT_SERVICE_FEE} SOL service fee!`;
export const PUMP_FUN_API = "https://frontend-api.pump.fun";
