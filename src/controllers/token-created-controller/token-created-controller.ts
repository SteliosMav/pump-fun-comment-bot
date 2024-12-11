import { AxiosError, AxiosResponse } from "axios";
import { TokenCreationEvent } from "../../listener/pump-fun-portal-listener";
import { ProxyRotator } from "../../proxy/ProxyRotator";
import { createWallet } from "../../solana/createWallet";
import { PumpFunService } from "../../pump-fun/pump-fun.service";
import chalk from "chalk";
import { ROTATING_PROXY_LIST } from "../../proxy/rotating_proxy-list";
import { BasicController } from "../basic.controller";

export class AccountState {
  private state: Map<string, string> = new Map();
}

export class TokenCreatedController implements BasicController {
  // Init dependencies
  private proxyRotator = new ProxyRotator(ROTATING_PROXY_LIST);
  private pumpFunService = new PumpFunService();

  private proxy = this.proxyRotator.getNextProxy(); // rotate through proxies
  private lastActionTime = 0; // user for throttle
  private commentsCounter = 0; // used for data analysis

  constructor() {}

  handleEvent(event: TokenCreationEvent) {
    const validEvent = this.isValid(event);

    if (!validEvent) return;

    this.processEvent(validEvent);
  }

  private async processEvent(
    event: TokenCreationEvent & { mint: string }
  ): Promise<void> {
    const mint = event.mint;

    try {
      await this.comment(mint);
      this.commentsCounter++;
      console.log(chalk.green(`Comment on "${mint}" succeeded at!`));
      console.log("Comments counter: ", this.commentsCounter);
    } catch (e) {
      const err = e as AxiosError;
      if (err.status) {
        console.log(chalk.red(`Comment on "${mint}" failed: ${err.status}`));
        console.log("Valid proxy: ", this.proxy);
      } else {
        console.log("Unknown error: ", err.status, this.proxy);
      }
    }

    this.proxy = this.proxyRotator.getNextProxy();
  }

  private isValid(
    event: TokenCreationEvent
  ): (TokenCreationEvent & { mint: string }) | null {
    // Validation logic
    if (!event.mint) return null;

    // Ensure `mint` is a string
    return { ...event, mint: event.mint };
  }

  private shouldThrottle() {
    const seconds = 2;
    const delay = 1000 * seconds;
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    if (currentTime - this.lastActionTime >= delay) {
      this.lastActionTime = currentTime; // Update the last action time
      return false; // Indicate that the action can proceed
    }

    return true; // Indicate that the action should be skipped
  }

  private async comment(mint: string): Promise<AxiosResponse> {
    const commentTxt = this.createCommentMsg();
    const secretKey = createWallet().secretKeyBase58;
    let authCookie: string | null = null;

    // Login and get auth cookie
    try {
      authCookie = await this.pumpFunService.login(secretKey, this.proxy);
      if (!authCookie) throw { status: 0 };
    } catch (e) {
      throw { status: 401 };
    }

    // try {
    //   await this.pumpFunService.updateProfile(
    //     {
    //       username: generateUsername(),
    //       profileImage: BOT_IMAGE_GIF,
    //       bio: BOT_DESCRIPTION,
    //     },
    //     authCookie,
    //     proxy
    //   );
    // } catch {
    //   // proxy = proxyRotator.getNextProxy();
    //   try {
    //     await this.pumpFunService.updateProfile(
    //       { profileImage: BOT_IMAGE_GIF, bio: BOT_DESCRIPTION },
    //       authCookie,
    //       proxy
    //     );
    //   } catch (e) {
    //     console.error("Error during profile update:", (e as AxiosError).status);
    //   }
    // }

    // Turn auth cookie into proxy-token (needed for comment header)
    let proxyToken: string | undefined;
    try {
      proxyToken = await this.pumpFunService.getProxyToken(authCookie);
    } catch (e) {
      throw { status: 403 };
    }

    // Upload image and get its URI
    let fileUri: string;
    try {
      fileUri = await this.pumpFunService.uploadImageToIPFS(authCookie);
    } catch (e) {
      throw { status: 0 };
    }

    // Post comment
    return this.pumpFunService.comment(
      commentTxt,
      mint,
      proxyToken,
      this.proxy
      // fileUri
    );
  }

  private createCommentMsg() {
    function randomWord(length: number) {
      const numbers = "23456789";
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const chars = letters;
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

    // return `(${number}) 🎁 FREE token-passes! 🎁 (${number})`;
    return `${word1} ${word2} ${word3}`;
    // return `FREE TOKEN PASSES (${word1}) telegram: ez[underscore]pump[underscore]bot`;
  }
}
