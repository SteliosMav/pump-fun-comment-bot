import { ProxyRotator } from "./proxy/proxy-rotator";
import { PumpFunService } from "./pump-fun/pump-fun.service";

export interface Dependencies {
  pumpFunService: PumpFunService;
  proxyRotator: ProxyRotator;
}
export type CommentMode =
  | { type: "new-tokens" }
  | { type: "specific-token"; mint: string };

export interface CommentConfig {
  delay: number; // Delays between requests in milliseconds
  safe: boolean; // Use comments that won't be detected as spam
}
