import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function isValidProxy(proxy: string): Promise<boolean> {
  const testUrl = [
    "https://httpbin.org/ip",
    "https://httpbin.org/headers",
    "https://httpbin.org/anything",
  ][1];
  const agent = new HttpsProxyAgent(proxy);

  console.log("Testing proxy: ", proxy);
  const response = await axios.get(testUrl, {
    httpsAgent: agent, // Use the proxy agent
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
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
    },
    timeout: 10000, // Set timeout
  });
  console.log("Proxy status: ", response.status);
  return true;
}
