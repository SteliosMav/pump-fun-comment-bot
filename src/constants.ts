import { toSolDecimals } from "./solana/utils";

const nikoSImage =
  "https://pump.mypinata.cloud/ipfs/QmVyVYvkJrhcXZRVWczW8nxzGYeL265j4gFQQ94QrWoX2U?img-width=128&img-dpr=2&img-onerror=redirect";
const botSAccImg =
  "https://pump.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7?img-width=64&img-dpr=2&img-onerror=redirect";

// // Bot info
export const BOT_NAME = "EzPump";
export const BOT_SERVICE_FEE = toSolDecimals(0.00019);
export const BOT_TOKEN_PASS_PRICE = toSolDecimals(0.07);
export const BOT_IMAGE_GIF = [
  "https://plum-near-goat-819.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7",
  botSAccImg,
  nikoSImage,
][1];
// Bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🎁FREE token-pass for new users! 🌐 Add "ez" in front of "pump.fun" | Telegram: "ez_" and "pump_" and "bot". The most reliable, cheap and easy to use!`;
export const PUMP_FUN_API = "https://frontend-api.pump.fun";
