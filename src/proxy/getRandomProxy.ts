import { ROTATING_PROXY_LIST } from "./rotating_proxy-list";

export function getRandomProxy() {
  const proxyList = ROTATING_PROXY_LIST;
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}
