import { isValidProxy } from "./src/proxy/isValidProxy";
import { ProxyRotator } from "./src/proxy/ProxyRotator";
import { STICKY_PROXY_LIST } from "./src/proxy/sticky-proxy-list";

(async () => {
  const proxyRotator = new ProxyRotator(STICKY_PROXY_LIST);
  const res = await isValidProxy(proxyRotator.getNextProxy());

  console.log(res);
})();
