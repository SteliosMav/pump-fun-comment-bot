import { PumpFunService } from "./pump-fun/pump-fun.service";
import { createWallet } from "./wallet/createWallet";
import chalk from "chalk";
import { getRandomProxy } from "./proxy/getRandomProxy";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "./constants";
import WebSocket from "ws";
import { AxiosError, AxiosResponse } from "axios";
import { STICKY_PROXY_LIST } from "./proxy/sticky-proxy-list";
import { ProxyRotator } from "./proxy/ProxyRotator";
import { ROTATING_PROXY_LIST } from "./proxy/rotating_proxy-list";

const comments = [
  "𝐅𝐑𝐄𝐄 token-pass! ezpump dot fun",
  "𝔉ℜ𝔈𝔈 tokΞn-pass! 𝕖zpump dot fun",
  "ƑRΣΣ token-ρass! ɘzpump dot fun",
  "₣ЯΣΞ token-pass! 𝑒𝑧pump dot fun",
  "ℱЯΣΣ tokєn-ραѕѕ! e𝘇pump dot fun",
  "𝙁𝙍ΞΞ tokξn-ρass! e𝔷pump dot fun",
  "ℑRΣΣ token-ραѕѕ! ezρump dot fun",
  "FЯΣΣ token-pαѕѕ! ezρu𝚖p dot fun",
  "ᖴℜΞΞ token-pαѕѕ! ezρuмρ dot fun",
  "𝔽𝕋ΞΞ tokꜱen-pass! ezρump dᴏt fun",
  "ŦℜΣΣ tok℮n-ραѕѕ! ezρump ɗot fun",
  "𝐹ℝΣΞ tokΞn-ραѕѕ! ezρump dot ғun",
  "F𝑹ΞΞ tokΞn-pαѕѕ! ezρump dot ꜰun",
  "ℱ𝔯ΣΣ tokᙓn-pass! ezρump dot 𝕗un",
  "ᖴЯΞΞ token-pαѕѕ! ezρump dot ƒun",
  "𝓕ЯΣΞ tokΞn-ραѕѕ! ezρump dot fuп",
  "𝙁ℜΞΞ token-pαѕѕ! ezρump dot ʄun",
  "𝔉ℝΣΞ tokΞn-pαѕѕ! ezρump dot ʄʋn",
  "ℱЯΞΞ tokΞn-pαѕѕ! ezpump d0t fun",
  "𝔽ℜΣΞ token-ραѕѕ! ezpump doτ fun",
  "ƑRΣΞ tokΞn-pαѕѕ! ezpump dot ғun",
  "𝐅ℜΣΞ token-pαѕѕ! ezpump dot ꜰun",
  "ℱЯΞΞ tokΞn-pass! ezpump dot ʄun",
  "ℱЯΞΞ tokΞn-pαѕѕ! ezpump dot ꜰυп",
  "ℑℝΣΞ token-pαѕѕ! ezpump dot ϝun",
  "𝓕ЯΣΞ tokΞn-pαѕѕ! ezpump dot ƒuп",
  "F𝔯ΣΞ tokΞn-pass! ezpump dot fun",
  "𝔉ℜΣΞ token-pass! ezρump dot f𝔲n",
  "ℱℜΣΞ tokΞn-pass! ezρump dot fυ𝑛",
  "ℑRΣΞ tokΞn-pαѕѕ! ezρump dot fun",
  "𝙁𝕋ΣΞ tokΞn-pαѕѕ! ezρuмρ dot ꜰun",
  "ℱЯΞΞ tokΞn-ρass! ezpump dot fᥙn",
  "𝐹ℝΣΞ tokΞn-ραѕѕ! eᴢpump dot fun",
  "ℑRΣΞ tokΞn-pαѕѕ! 𝖊zpump dot fun",
  "𝔽𝕋ΞΞ tokΞn-pass! 𝘦𝓏pump dot fun",
  "ℱℜΣΞ tokΞn-pass! ezρump dot ꜰu𝓃",
  "𝔉ℝΞΞ tokΞn-pαѕѕ! ezρump dot ꜰ𝕦n",
  "ℱℜΞΞ tokΞn-pass! ezpump dot fᥙ𝑛",
  "𝐹ℜΞΞ token-pass! ezpump dot ꜰu𝚗",
  "𝔽ℜΞΞ tokΞn-pass! ezpump dot ꜰυ𝕟",
  "ℑRΞΞ tokΞn-pass! e𝔃pump dot fun",
  "ℱℜΣΞ tokΞn-ρass! ezρump dot ꜰuη",
  "ℱ𝕋ΞΞ tokΞn-ρass! e𝑧pump dot fun",
  "ℑℜΣΞ tokΞn-pass! ezpump dot ꜰuп",
  "𝔉ℜΞΞ tokΞn-pαѕѕ! e𝕫pump dot fun",
  "𝓕ℜΞΞ tokΞn-pαѕѕ! ezρump dot fun",
  "𝐅ℜΞΞ tokΞn-ρass! ezρump dot ꜰun",
  "𝙁ℜΞΞ tokΞn-pαѕѕ! ezρump dot ƒun",
  "ℱℜΞΞ tokΞn-pass! ezρump dot ʄuп",
  "ℑℜΞΞ tokΞn-ρass! ezρump dot ꜰυп",
  "ℱℜΞΞ tokΞn-pαѕѕ! ezρump dot ꜰuп",
  "𝐹ℜΞΞ tokΞn-pass! ezpump dot ʄuи",
  "ℑRΞΞ tokΞn-pαѕѕ! ezpump dot ϝυп",
  "𝓕ℜΞΞ tokΞn-pαѕѕ! ezpump dot ʄu𝕟",
  "𝔽ℜΞΞ tokΞn-pass! ezpump dot ꜰυ𝓃",
];

interface TokenCreationMsg {
  signature: string; // Unique signature of the transaction
  mint: string; // Unique identifier for the token
  traderPublicKey: string; // Public key of the trader
  txType: "create"; // Transaction type (always 'create' for token creation)
  initialBuy: number; // Initial amount of tokens purchased
  bondingCurveKey: string; // Identifier for the bonding curve associated with the token
  vTokensInBondingCurve: number; // Total number of virtual tokens in the bonding curve
  vSolInBondingCurve: number; // Total number of virtual SOL in the bonding curve
  marketCapSol: number; // Market capitalization of the token in SOL
  name: string; // Token name
  symbol: string; // Token symbol
  uri: string; // URI pointing to token metadata
}

// Track active connection
let activeConnection: WebSocket | null = null;
const proxyRotator = new ProxyRotator(ROTATING_PROXY_LIST);

let lastActionTime = 0;
function shouldContinue() {
  const seconds = 5;
  const delay = 1000 * seconds;
  const currentTime = Date.now(); // Get the current timestamp in milliseconds

  if (currentTime - lastActionTime >= delay) {
    lastActionTime = currentTime; // Update the last action time
    return true; // Indicate that the action can proceed
  }

  return false; // Indicate that the action should be skipped
}

function connect() {
  if (activeConnection) {
    console.log("Connection already active, skipping new connection.");
    return;
  }

  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  activeConnection = ws;
  let proxy = proxyRotator.getNextProxy();

  ws.on("open", () => {
    console.log("Connected to PumpPortal WebSocket");
    // Subscribe to new token creations
    const payload = { method: "subscribeNewToken" }; // Updated method for subscription
    ws.send(JSON.stringify(payload));
  });

  ws.on("message", async (data) => {
    if (!shouldContinue()) {
      return;
    }

    const message: TokenCreationMsg = JSON.parse(data.toString());

    function generateRandomSentence() {
      function randomWord(length: number) {
        const letters = "1234567890";
        let word = "";
        for (let i = 0; i < length; i++) {
          word += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return word;
      }

      // Define the desired lengths for each word
      const lengthWord1 = 2; // Length of the first word
      const lengthWord2 = 2; // Length of the second word
      const lengthWord3 = 2; // Length of the third word

      const word1 = randomWord(lengthWord1);
      const word2 = randomWord(lengthWord1); // This remains constant as per your example
      const word3 = randomWord(lengthWord3);

      return `${word1} FREE TOKEN PASS ${word1} FOR NEW USERS ${word1}`;
    }
    const comment = generateRandomSentence();
    const sec30 = 62 * 1000;

    try {
      const res = await autoCommentByMint(proxy, message.mint, comment, sec30);
      console.log(
        chalk.green(
          `Comment on "${message.name}" succeeded at ${
            (res as any).retries
          } retries! Res:`
        ),
        res.status
      );
    } catch (e) {
      const err = e as any;
      console.log(
        chalk.red(`Comment on "${message.name}" failed: ${err.status}`)
      );
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
    restart(ws);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
    restart(ws);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    restart(ws); // Exit after logging
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    restart(ws);
  });
}

async function restart(ws: WebSocket) {
  if (ws && ws.readyState !== WebSocket.CLOSED) {
    console.log("Closing existing WebSocket connection...");
    ws.terminate();
  }

  activeConnection = null; // Reset active connection
  console.log("Restarting WebSocket connection in 5 seconds...");
  setTimeout(connect, 5000); // Restart after a delay
}

/**
 * Retrieves a random string from an array of strings.
 *
 * @param stringsArray - An array of strings.
 * @returns A randomly selected string from the array, or null if the array is empty.
 */
function getRandomCommentMsg(): string {
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}

async function autoCommentByMint(
  proxy: string,
  mint: string,
  msg?: string,
  delay?: number
): Promise<AxiosResponse> {
  const commentTxt = msg ? msg : "FREE token-pass! ezpump dot fun";
  const pumpFunService = new PumpFunService();

  // const proxy = getRandomProxy();

  let authCookie: string | null = null;
  const secretKey = createWallet().secretKeyBase58;

  try {
    authCookie = await pumpFunService.login(secretKey, proxy);
    if (!authCookie) throw { status: 0 };
  } catch (e) {
    try {
      proxy = proxyRotator.getNextProxy();
      authCookie = await pumpFunService.login(secretKey, proxy);
      if (!authCookie) throw { status: 0 };
    } catch (e) {
      throw { status: 0 };
    }
  }

  try {
    await pumpFunService.updateProfile(
      { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
      authCookie,
      proxy
    );
  } catch {
    proxy = proxyRotator.getNextProxy();
    try {
      await pumpFunService.updateProfile(
        { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
        authCookie,
        proxy
      );
    } catch (e) {
      console.error("Error during profile update:", (e as AxiosError).status);
    }
  }

  let proxyToken: string | undefined;
  try {
    proxyToken = await pumpFunService.getProxyToken(authCookie);
  } catch (e) {
    try {
      proxyToken = await pumpFunService.getProxyToken(authCookie);
    } catch (e) {
      proxy = proxyRotator.getNextProxy();
      throw { status: 0 };
    }
  }

  return new Promise((resolve, reject) => {
    const maxRetries = 1;
    let retries = 0;

    const attempt = async () => {
      try {
        const res = await pumpFunService.comment(
          commentTxt,
          mint,
          proxyToken,
          retries === 0 ? proxy : proxyRotator.getNextProxy() // Use original proxy on first attempt
        );
        resolve({ ...res, retries } as any); // If successful, resolve the promise
      } catch (e) {
        retries++;
        if (retries >= maxRetries) {
          reject(e); // Reject if max retries reached
        } else {
          setTimeout(attempt, delay);
        }
      }
    };

    attempt(); // Start the first attempt
  });
}

// Initiate the WebSocket connection
connect();
