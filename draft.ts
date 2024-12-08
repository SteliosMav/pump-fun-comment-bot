import chalk from "chalk";
import { isValidProxy } from "./src/proxy/isValidProxy";
import { ProxyRotator } from "./src/proxy/ProxyRotator";
import { STICKY_PROXY_LIST } from "./src/proxy/sticky-proxy-list";
import { ROTATING_PROXY_LIST } from "./src/proxy/rotating_proxy-list";

(async () => {
  const proxyRotator = new ProxyRotator(STICKY_PROXY_LIST);
  const validProxies = [];
  const invalidProxies = [];

  for (let index = 0; index < ROTATING_PROXY_LIST.length; index++) {
    const proxy = STICKY_PROXY_LIST[index];
    try {
      const res = await isValidProxy(proxy);
      validProxies.push(proxy);
    } catch (e) {
      console.log((e as any).status);
      invalidProxies.push(index);
    }
  }

  console.log(chalk.green("Valid proxies: "), validProxies);
  console.log(chalk.red("Invalid proxies: "), invalidProxies);
})();
