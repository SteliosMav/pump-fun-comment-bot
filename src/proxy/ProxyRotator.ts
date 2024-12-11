export class ProxyRotator {
  private proxies: string[];
  private index: number;

  constructor(proxies: string[]) {
    if (!Array.isArray(proxies) || proxies.length === 0) {
      throw new Error("Proxies must be a non-empty array.");
    }
    this.proxies = proxies;
    this.index = 700;
  }

  getNextProxy() {
    const proxy = this.proxies[this.index];
    if (this.index >= this.proxies.length) {
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
