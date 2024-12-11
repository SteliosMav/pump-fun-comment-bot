import { AxiosError, AxiosResponse } from "axios";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "../constants";
import { TokenCreationMsg } from "../listener/pump-fun-portal-listener";
import { ProxyRotator } from "../proxy/ProxyRotator";
import { STICKY_PROXY_LIST } from "../proxy/sticky-proxy-list";
import { generateUsername } from "../pump-fun/util";
import { createWallet } from "../wallet/createWallet";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import chalk from "chalk";
import { ROTATING_PROXY_LIST } from "../proxy/rotating_proxy-list";

const proxyRotator = new ProxyRotator(ROTATING_PROXY_LIST);
let lastActionTime = 0;

function shouldContinue() {
  const seconds = 2;
  const delay = 1000 * seconds;
  const currentTime = Date.now(); // Get the current timestamp in milliseconds

  if (currentTime - lastActionTime >= delay) {
    lastActionTime = currentTime; // Update the last action time
    return true; // Indicate that the action can proceed
  }

  return false; // Indicate that the action should be skipped
}

let commentsCounter = 0;

export async function tokenCreationController(message: TokenCreationMsg) {
  // if (!shouldContinue()) {
  //   return;
  // }

  let proxy = proxyRotator.getNextProxy();

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
    const lengthWord3 = 5; // Length of the third word

    const number = randomWord(lengthNumber);
    const word1 = randomWord(lengthWord1); // This remains constant as per your example
    const word2 = randomWord(lengthWord2);
    const word3 = randomWord(lengthWord3);

    return `(${number}) 🎁 FREE token-passes! 🎁 (${number})`;
    // return `${word1} ${word2} ${word3}`;
    // return `FREE TOKEN PASSES (${word1}) telegram: ez[underscore]pump[underscore]bot`;
  }
  // const comment = generateRandomSentence(); // getNextMessage();
  const delays = [
    8, 34,
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
            `Comment on "${message.mint}" succeeded at ${
              (res as any).retries
            } retries! Res:`
          ),
          res.status
        );
        console.log("Comments counter: ", commentsCounter);
      } catch (e) {
        const err = e as any;
        console.log(
          chalk.red(`Comment on "${message.mint}" failed: ${err.status}`)
        );
      }
    });

    await Promise.all(promises); // Wait for all requests to complete
  })();
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

  // const fileUri = await pumpFunService.uploadImageToIPFS(authCookie);
  // if (!fileUri) throw { status: 0 };

  return new Promise((resolve, reject) => {
    const maxRetries = 3;
    let retries = 0;

    const attempt = async () => {
      try {
        const res = await pumpFunService.comment(
          commentTxt,
          mint,
          proxyToken,
          proxy
          // fileUri
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
