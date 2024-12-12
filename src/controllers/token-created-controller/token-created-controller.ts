import { AxiosError, AxiosResponse } from "axios";
import { TokenCreationEvent } from "../../listener/pump-fun-portal-listener";
import { ProxyRotator } from "../../proxy/ProxyRotator";
import { PumpFunService } from "../../pump-fun/pump-fun.service";
import chalk from "chalk";
import { BasicController } from "../basic.controller";
import { AccountState } from "../../account-state/account-state";

export class TokenCreatedController implements BasicController {
  private proxy = this.proxyRotator.proxy; // rotate through proxies
  private lastActionTime = 0; // user for throttle
  private commentsCounter = 0; // used for data analysis

  constructor(
    private proxyRotator: ProxyRotator,
    private pumpFunService: PumpFunService,
    private accState: AccountState
  ) {}

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
      } else {
        console.log("Unknown error: ", err.status, this.proxy);
      }
    }

    this.proxy = this.proxyRotator.proxy;
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
    const proxyToken = this.accState.account;
    const commentTxt = this.createCommentMsg();

    // // Turn auth cookie into proxy-token (needed for comment header)
    // let proxyToken: string | undefined;
    // try {
    //   proxyToken = await this.pumpFunService.getProxyToken(authCookie);
    // } catch (e) {
    //   const error = e as AxiosError;
    //   console.error(chalk.red("Error generating proxy-token."));
    //   throw { status: error.status || 403 };
    // }

    // Upload image and get its URI
    let fileUri: string;
    try {
      fileUri = await this.pumpFunService.uploadImageToIPFS(proxyToken);
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
}
