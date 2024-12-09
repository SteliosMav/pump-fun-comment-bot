import chalk from "chalk";
import { isValidProxy } from "./src/proxy/isValidProxy";
import { ProxyRotator } from "./src/proxy/ProxyRotator";
import { STICKY_PROXY_LIST } from "./src/proxy/sticky-proxy-list";
import { ROTATING_PROXY_LIST } from "./src/proxy/rotating_proxy-list";
import axios, { AxiosError } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { PumpFunService } from "./src/pump-fun/pump-fun.service";
import { createWallet } from "./src/wallet/createWallet";

const proxyRotator = new ProxyRotator(ROTATING_PROXY_LIST);

(async () => {
  const pumpFunService = new PumpFunService();
  const proxy = proxyRotator.getNextProxy();

  let authCookie: string | null = null;
  const secretKey = createWallet().secretKeyBase58;
  try {
    authCookie = await pumpFunService.login(secretKey, proxy);
    if (!authCookie) {
      console.log("Login failed");
      return;
    }
  } catch (e) {
    console.log("Login failed.");
    return;
  }

  const res = await commentThread(
    "RGwgyvtLiiu5gPGSQSkv4pY9vQ1D6MuQd1PEavUpump",
    authCookie,
    proxy
  );
  // const proxyRotator = new ProxyRotator(STICKY_PROXY_LIST);
  // const validProxies = [];
  // const invalidProxies = [];

  // for (let index = 0; index < ROTATING_PROXY_LIST.length; index++) {
  //   const proxy = STICKY_PROXY_LIST[index];
  //   try {
  //     const res = await isValidProxy(proxy);
  //     validProxies.push(proxy);
  //   } catch (e) {
  //     console.log((e as any).status);
  //     invalidProxies.push(index);
  //   }
  // }

  // console.log(chalk.green("Valid proxies: "), validProxies);
  // console.log(chalk.red("Invalid proxies: "), invalidProxies);
})();

async function commentThread(threadId: string, token: string, proxy: string) {
  // console.log("Auth cookie: ", token);
  // return;
  const commentsUrl = `https://pump.fun/comments`;
  try {
    const response = await axios.get(commentsUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const comments = response.data.comments;
    const commentId = comments[Math.floor(Math.random() * comments.length)].id;
    const randomCommentText = "test";
    const config: any = {
      headers: {
        Cookie: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `#${commentId} ${randomCommentText}`,
        mint: threadId,
        // token,
      }),
    };
    if (proxy) {
      // if (proxy.startsWith("http")) {
      config.agent = new HttpsProxyAgent(proxy);
      // } else if (proxy.startsWith("socks")) {
      //   config.agent = new socksProxyAgent(proxy);
      // }
    }
    const postUrl = `https://pumpfun.com/thread/${threadId}/comment`;
    const postResponse = await axios.post(postUrl, config);
    if (postResponse.status === 200) {
      console.log(chalk.greenBright(`Commented: ${randomCommentText}`));
    } else {
      console.log(
        chalk.redBright(`Failed to comment: ${postResponse.statusText}`)
      );
    }
  } catch (error) {
    console.log(
      chalk.redBright("Error posting comment:", (error as AxiosError).message)
    );
  }
}
