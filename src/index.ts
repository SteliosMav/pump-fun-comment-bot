import { PumpFunService } from "./pump-fun/pump-fun.service";
import { createWallet } from "./wallet/createWallet";
import chalk from "chalk";
import { getRandomProxy } from "./proxy/getRandomProxy";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "./constants";
import WebSocket from "ws";
import { AxiosError, AxiosResponse } from "axios";

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

function connect() {
  if (activeConnection) {
    console.log("Connection already active, skipping new connection.");
    return;
  }

  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  activeConnection = ws;

  ws.on("open", () => {
    console.log("Connected to PumpPortal WebSocket");
    // Subscribe to new token creations
    const payload = { method: "subscribeNewToken" }; // Updated method for subscription
    ws.send(JSON.stringify(payload));
  });

  ws.on("message", async (data) => {
    const message: TokenCreationMsg = JSON.parse(data.toString());
    try {
      const comment = getRandomCommentMsg();
      const res = await autoCommentByMint(message.mint, comment);
      console.log(
        chalk.green(`Comment on "${message.name}" succeeded! Res:`),
        res.status
      );
    } catch (e) {
      const err = e as any;
      console.log(
        chalk.red(`Comment on "${message.name}" failed: ${err.status}`)
      );
    }

    try {
      const res = await autoCommentByMint(message.mint);
      console.log(
        chalk.green(`Comment on "${message.name}" succeeded! Res:`),
        res.status
      );
    } catch (e) {
      const err = e as any;
      console.log(
        chalk.red(`Comment on "${message.name}" failed: ${err.status}`)
      );
    }

    setTimeout(async () => {
      try {
        const res = await autoCommentByMint(message.mint);
        console.log(
          chalk.green(`Comment on "${message.name}" succeeded! Res:`),
          res.status
        );
      } catch (e) {
        const err = e as any;
        console.log(
          chalk.red(`Comment on "${message.name}" failed: ${err.status}`)
        );
      }
    }, 6000);
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
  const comments = ["Pump it together!", "Let's pump!", "Bump with us!"];
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}

async function autoCommentByMint(
  mint: string,
  msg?: string
): Promise<AxiosResponse> {
  const commentTxt = msg ? msg : "FREE token-pass! ezpump(dot)fun";
  const pumpFunService = new PumpFunService();

  const proxy = getRandomProxy();
  let authCookie: string | null = null;
  const secretKey = createWallet().secretKeyBase58;

  try {
    authCookie = await pumpFunService.login(secretKey, proxy);
    if (!authCookie) throw { status: 0 };
  } catch (e) {
    throw { status: 0 };
  }

  try {
    await pumpFunService.updateProfile(
      { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
      authCookie,
      proxy
    );
  } catch {
    const newProxy = getRandomProxy();
    try {
      await pumpFunService.updateProfile(
        { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
        authCookie,
        newProxy
      );
    } catch (e) {
      console.error("Error during profile update:", (e as AxiosError).status);
    }
  }

  let proxyToken: string | undefined;
  try {
    proxyToken = await pumpFunService.getProxyToken(authCookie);
  } catch (e) {
    throw { status: 0 };
  }

  try {
    const res = await pumpFunService.comment(
      commentTxt,
      mint,
      proxyToken,
      proxy
    );
    return res;
  } catch (e) {
    const newProxy = getRandomProxy();
    return pumpFunService.comment(commentTxt, mint, proxyToken, newProxy);
  }
}

// Initiate the WebSocket connection
connect();
