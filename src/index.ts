import { PumpFunService } from "./pump-fun/pump-fun.service";
import { createWallet } from "./wallet/createWallet";
import chalk from "chalk";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "./constants";
import WebSocket from "ws";
import { AxiosError, AxiosResponse } from "axios";
import { STICKY_PROXY_LIST } from "./proxy/sticky-proxy-list";
import { ProxyRotator } from "./proxy/ProxyRotator";
import { ROTATING_PROXY_LIST } from "./proxy/rotating_proxy-list";
import { generateUsername } from "./pump-fun/util";

function createMessageRotator() {
  const messages = [
    "FREE TOKEN PASS FOR NEW USERS - ezpump dot fun",
    "FREE T0KEN PA5S F0R NEW USER5 + ezpump dot fun",
    "Frėē TØKEN PA5S FØR NEW USER5 -- ezpump dot fun",
    "Freē TΟKEN PΑSS FΟR NΕW USΕRS __ ezpump dot fun",
    "FR33 Töken ΡASS för ΝEW ÜSERS ! ezpump dot fun",
    // "FREE token-pass - ezpump dot fun!",
    // "EzPump gives token passes for FREE - ezpump dot fun!",
    // "We give a FREE token-pass to each new user - ezpump dot fun!",
    // "FREE token pass for new users - ezpump dot fun",
    // "Get your FREE token-pass now! - ezpump dot fun",
    // "All new users get a FREE token pass! ezpump dot fun",
  ];
  let index = 0; // Start at the first message

  return function getNextMessage() {
    const message = messages[index];
    index = (index + 1) % messages.length; // Increment index and wrap around if needed
    return message + " - random:" + Math.floor(Math.random() * 90) + 10;
  };
}

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
  const seconds = 0;
  const delay = 1000 * seconds;
  const currentTime = Date.now(); // Get the current timestamp in milliseconds

  if (currentTime - lastActionTime >= delay) {
    lastActionTime = currentTime; // Update the last action time
    return true; // Indicate that the action can proceed
  }

  return false; // Indicate that the action should be skipped
}

let commentsCounter = 0;

function connect() {
  if (activeConnection) {
    console.log("Connection already active, skipping new connection.");
    return;
  }

  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  activeConnection = ws;
  let proxy = proxyRotator.getNextProxy();
  const getNextMessage = createMessageRotator();

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
        const numbers = "23456789";
        const letters = "abcdefghijklmnopqrstuvwxyz";
        const chars = numbers;
        let word = "";
        for (let i = 0; i < length; i++) {
          word += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return word;
      }

      // Define the desired lengths for each word
      const lengthNumber = 3; // Length of the first word
      const lengthWord1 = 5; // Length of the second word
      const lengthWord2 = 5; // Length of the third word

      const number = randomWord(lengthNumber);
      const word1 = randomWord(lengthWord1); // This remains constant as per your example
      const word2 = randomWord(lengthWord2);

      return `ZERO COST token-passes for new users! ${number}`;
      // return `${word1} ${word2}`;
      // return `FREE TOKEN PASSES (${word1}) telegram: ez[underscore]pump[underscore]bot`;
    }
    // const comment = generateRandomSentence(); // getNextMessage();
    const delays = [
      8,
      // Math.floor(Math.random() * (60 - 10 + 1)) + 10
    ].map((el) => el * 1000);

    (async () => {
      const promises = delays.map(async (delay, index) => {
        try {
          const res = await autoCommentByMint(
            proxy,
            message.mint,
            generateRandomSentence(),
            delay
          );
          commentsCounter++;
          console.log(
            chalk.green(
              `Index: ${index} - Comment on "${message.mint}" succeeded at ${
                (res as any).retries
              } retries! Res:`
            ),
            res.status
          );
          console.log("Comments counter: ", commentsCounter);
        } catch (e) {
          const err = e as any;
          console.log(
            chalk.red(
              `Index: ${index} - Comment on "${message.mint}" failed: ${err.status}`
            )
          );
        }
      });

      await Promise.all(promises); // Wait for all requests to complete
    })();
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
      // proxy = proxyRotator.getNextProxy();
      authCookie = await pumpFunService.login(secretKey, proxy);
      if (!authCookie) throw { status: 0 };
    } catch (e) {
      throw { status: 0 };
    }
  }

  try {
    await pumpFunService.updateProfile(
      {
        username: generateUsername(),
        profileImage: BOT_IMAGE_GIF,
        bio: BOT_DESCRIPTION,
      },
      authCookie,
      proxy
    );
  } catch {
    // proxy = proxyRotator.getNextProxy();
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
      // proxy = proxyRotator.getNextProxy();
      throw { status: 0 };
    }
  }

  return new Promise((resolve, reject) => {
    const maxRetries = 0;
    let retries = 0;

    const attempt = async () => {
      try {
        const res = await pumpFunService.comment(
          commentTxt,
          mint,
          proxyToken,
          proxy
          // retries === 0 ? proxy : proxyRotator.getNextProxy() // Use original proxy on first attempt
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
