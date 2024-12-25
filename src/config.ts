import { CommentConfig, CommentMode } from "./types";

// Commenting
export const COMMENT_CONFIG_LIST: CommentConfig[] = [
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
  { delay: 0, safe: true },
];
export const COMMENT_MODE: CommentMode = { type: "new-tokens" }; // Comment on new tokens or a specific token

// Account generator
export const ACCOUNTS_AHEAD = {
  min: 3 * COMMENT_CONFIG_LIST.length,
  max: 7 * COMMENT_CONFIG_LIST.length,
}; // Starting from 0. Maximum number of accounts to create. WARNING: too many accounts ahead can create proxy tokens that take too much to resolve and thus they expire. This can lead to a ban and a VPN IP refresh will be needed.
export const CONCURRENT_ACCOUNT_CREATION = 20 * COMMENT_CONFIG_LIST.length; // Number of accounts to create in parallel
export const PROFILE_FIELDS_TO_UPDATE: ("image" | "bio" | "username")[] = [
  "username",
  "image",
  "bio",
]; // Update account profiles with bot's information

// Proxy rotator
export const USE_STICKY_PROXY = false; // Use 900 sticky proxies or 10 rotating proxies
