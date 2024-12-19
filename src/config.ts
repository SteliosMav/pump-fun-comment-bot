import { CommentMode } from "./types";

// Commenting
export const TIMES_TO_COMMENT = 1; // Number of times to comment on a token creation event
export const COMMENT_DELAY = 1000 * 14; // Delay between comments in milliseconds
export const DELAYS = [1000 * 15, 1000 * 40]; // If exists, it will overwrite the above two options. Delays between requests in milliseconds
export const COMMENT_MODE: CommentMode = { type: "new-tokens" }; // Comment on new tokens or a specific token

// Account state
export const MAX_ACCOUNT_SIZE = 4000; // Starting from 0. Maximum number of accounts to create
export const CONCURRENT_ACCOUNT_CREATION = 20; // Number of accounts to create in parallel
