import { ProxyRotator } from "./proxy/ProxyRotator";
import { PumpFunService } from "./pump-fun/pump-fun.service";

export interface Dependencies {
  pumpFunService: PumpFunService;
  proxyRotator: ProxyRotator;
}
export type CommentMode =
  | { type: "new-tokens" }
  | { type: "specific-token"; mint: string };
