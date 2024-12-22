import { USE_STICKY_PROXY } from "../config";
import { ROTATING_PROXY_LIST } from "./rotating_proxy-list";
import { STICKY_PROXY_LIST } from "./sticky-proxy-list";

export class ProxyRotator {
  private proxies = USE_STICKY_PROXY ? STICKY_PROXY_LIST : ROTATING_PROXY_LIST;
  private index = 0;

  constructor() {}

  get proxy(): string {
    const proxy = this.proxies[this.index];
    const isLast = this.index + 1 >= this.proxies.length;
    if (isLast) {
      this.index = 0;
    } else {
      this.index++;
    }
    // Log only for sticky proxies that are about 900 and you need to know where you were left
    if (this.proxies.length >= 100) {
      console.log("Proxy index:", this.index);
    }
    return proxy;
  }
}
