import { PROXY_LIST } from "./proxy-list";

export function getRandomProxy() {
  const proxyList = PROXY_LIST;
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}
