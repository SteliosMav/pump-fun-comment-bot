import { CommentMode } from "./types";

// Commenting
export const DELAYS = [0, 0, 0, 0]; // Delays between requests in milliseconds
export const COMMENT_MODE: CommentMode = { type: "new-tokens" }; // Comment on new tokens or a specific token
export const SAFE_COMMENTS = false; // Use comments that won't be detected as spam

// Account generator
export const ACCOUNTS_AHEAD = {
  min: 3 * DELAYS.length,
  max: 7 * DELAYS.length,
}; // Starting from 0. Maximum number of accounts to create. WARNING: too many accounts ahead can create proxy tokens that take too much to resolve and thus they expire. This can lead to a ban and a VPN IP refresh will be needed.
export const CONCURRENT_ACCOUNT_CREATION = 20 * DELAYS.length; // Number of accounts to create in parallel
export const PROFILE_FIELDS_TO_UPDATE: ("image" | "bio" | "username")[] = [
  "username",
  "image",
  "bio",
]; // Update account profiles with bot's information

// Proxy rotator
export const USE_STICKY_PROXY = false; // Use 900 sticky proxies or 10 rotating proxies
