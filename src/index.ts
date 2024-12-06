import { PumpFunService } from "./pump-fun/pump-fun.service";
import { createWallet } from "./wallet/createWallet";
import chalk from "chalk";
import { getRandomProxy } from "./proxy/getRandomProxy";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "./constants";
import WebSocket from "ws";
import { AxiosError, AxiosResponse } from "axios";

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

function connect() {
  if (activeConnection) {
    console.log("Connection already active, skipping new connection.");
    return;
  }

  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  activeConnection = ws;
  let currentMsgIdx = 0;

  ws.on("open", () => {
    console.log("Connected to PumpPortal WebSocket");
    // Subscribe to new token creations
    const payload = { method: "subscribeNewToken" }; // Updated method for subscription
    ws.send(JSON.stringify(payload));
  });

  ws.on("message", async (data) => {
    const message: TokenCreationMsg = JSON.parse(data.toString());

    function getNextComment() {
      const comment = comments[currentMsgIdx];
      currentMsgIdx = (currentMsgIdx + 1) % comments.length; // Move to the next comment, wrap around at the end
      return comment;
    }

    function generateRandomSentence() {
      function randomWord(length: number) {
        const letters = "abcdefghijklmnopqrstuvwxyz";
        let word = "";
        for (let i = 0; i < length; i++) {
          word += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return word;
      }

      const word1 = randomWord(Math.floor(Math.random() * 6) + 3); // Random length between 3 and 8
      const word2 = randomWord(Math.floor(Math.random() * 6) + 3); // Random length between 3 and 8
      const word3 = randomWord(Math.floor(Math.random() * 6) + 3); // Random length between 3 and 8

      return `${word1} ${word2} ${word3}`;
    }
    const comment = generateRandomSentence();
    // const comment = getNextComment();
    const sec30 = 30 * 1000;

    try {
      const res = await autoCommentByMint(message.mint, comment, sec30);
      console.log(
        chalk.green(`Comment on "${message.name}" succeeded! Res:`),
        res.status
      );
    } catch (e) {
      try {
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
  mint: string,
  msg?: string,
  delay?: number
): Promise<AxiosResponse> {
  const commentTxt = msg ? msg : "FREE token-pass! ezpump dot fun";
  const pumpFunService = new PumpFunService();

  const proxy = getRandomProxy();
  let authCookie: string | null = null;
  const secretKey = createWallet().secretKeyBase58;

  try {
    authCookie = await pumpFunService.login(secretKey, getRandomProxy());
    if (!authCookie) throw { status: 0 };
  } catch (e) {
    throw { status: 0 };
  }

  try {
    await pumpFunService.updateProfile(
      { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
      authCookie,
      getRandomProxy()
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

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await pumpFunService.comment(
          commentTxt,
          mint,
          proxyToken,
          getRandomProxy()
        );
        resolve(res);
      } catch (e) {
        const newProxy = getRandomProxy();
        try {
          resolve(
            await pumpFunService.comment(commentTxt, mint, proxyToken, newProxy)
          );
        } catch (e) {
          reject(e);
        }
      }
    }, delay);
  });
}

// Initiate the WebSocket connection
connect();
