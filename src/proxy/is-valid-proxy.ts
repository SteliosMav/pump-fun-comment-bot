import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function isValidProxy(proxy: string): Promise<boolean> {
  const testUrl = [
    "https://httpbin.org/ip",
    "https://httpbin.org/headers",
    "https://httpbin.org/anything",
  ][1];
  const agent = new HttpsProxyAgent(proxy);
  const payload = {
    text: "Test",
    mint: "Test",
    // fileUri:
    //   "https://plum-near-goat-819.mypinata.cloud/ipfs/QmUY5WJiwfz62xX8yswwqjEJEZ6K4MieQVGJez3iwqaSZz?img-width=800&img-dpr=2&img-onerror=redirect",
  };
  const headers = {
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    // "content-length": Buffer.byteLength(
    //   JSON.stringify(payload),
    //   "utf-8"
    // ).toString(),
    "content-type": "application/json",
    origin: "https://pump.fun",
    priority: "u=1, i",
    referer: "https://pump.fun/",
    "sec-ch-ua":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "x-aws-proxy-token": "proxyToken",
  };
  console.log("Before..");
  const response = await axios.get(testUrl, {
    httpsAgent: agent, // Use the proxy agent
    headers,
    timeout: 10000, // Set timeout
  });
  console.log("Proxy status: ", response.status);
  return true;
}
