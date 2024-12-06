export class ProxyRotator {
  private proxies: string[];
  private index: number;

  constructor(proxies: string[]) {
    if (!Array.isArray(proxies) || proxies.length === 0) {
      throw new Error("Proxies must be a non-empty array.");
    }
    this.proxies = proxies;
    this.index = 0;
  }

  getNextProxy() {
    const proxy = this.proxies[this.index];
    this.index = (this.index + 1) % this.proxies.length; // Cycle back to the start
    return proxy;
  }
}
