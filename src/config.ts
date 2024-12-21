import { CommentMode } from "./types";

// Commenting
export const DELAYS = [0, 1000 * 15]; // If exists, it will overwrite the above two options. Delays between requests in milliseconds
export const COMMENT_MODE: CommentMode = { type: "new-tokens" }; // Comment on new tokens or a specific token
// Account generator
export const ACCOUNTS_AHEAD = { min: 100, max: 200 }; // Starting from 0. Maximum number of accounts to create
export const CONCURRENT_ACCOUNT_CREATION = 30; // Number of accounts to create in parallel
export const PROFILE_FIELDS_TO_UPDATE: ("image" | "bio")[] = ["bio", "image"]; // Update account profiles with bot's information
