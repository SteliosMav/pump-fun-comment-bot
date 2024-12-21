import { AxiosError, AxiosResponse } from "axios";
import { TokenCreationEvent } from "../../listener/pump-fun-portal-listener";
import { ProxyRotator } from "../../proxy/ProxyRotator";
import { PumpFunService } from "../../pump-fun/pump-fun.service";
import chalk from "chalk";
import { BasicController } from "../basic.controller";
import { AccountGenerator } from "../../account-generator/account-generator";
import { ACCOUNT_SOURCE, COMMENT_MODE, DELAYS } from "../../config";
import { CommentGenerator } from "../../comment-generator/comment-generator";

export class TokenCreatedController implements BasicController {
  private proxy = this.proxyRotator.proxy; // rotate through proxies
  private lastActionTime = 0; // user for throttle
  private commentsCounter = 0; // used for data analysis

  constructor(
    private proxyRotator: ProxyRotator,
    private pumpFunService: PumpFunService,
    private commentGenerator: CommentGenerator,
    private accGen: AccountGenerator
  ) {
    if (ACCOUNT_SOURCE === "generator") {
      accGen.load();
    }
  }

  handleEvent(event: TokenCreationEvent) {
    const validEvent = this.isValid(event);

    if (!validEvent) return;

    // Call the function X times
    for (let i = 0; i < DELAYS.length; i++) {
      const delay = DELAYS[i];
      if (delay) {
        setTimeout(() => this.processEvent(validEvent), delay);
      } else {
        this.processEvent(validEvent);
      }
    }
  }

  private async processEvent(
    event: TokenCreationEvent & { mint: string }
  ): Promise<void> {
    const mint =
      COMMENT_MODE.type === "specific-token" ? COMMENT_MODE.mint : event.mint;

    try {
      await this.comment(mint);
      this.commentsCounter++;
      console.log(chalk.green(`Comment on "${mint}" succeeded at!`));
      console.log("Comments counter: ", this.commentsCounter);
    } catch (e) {
      const err = e as AxiosError;
      if (err.status) {
        console.log(
          chalk.red(
            `Comment on "${mint}" failed: ${err.status}. Error message: ${err.message}`
          )
        );
      } else {
        console.log("Unknown error: ", err.status, err.message, this.proxy);
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
    const proxyToken = this.accGen.account;
    const commentTxt = this.commentGenerator.comment;

    // // Upload image and get its URI
    // let fileUri: string;
    // try {
    //   fileUri = await this.pumpFunService.uploadImageToIPFS(proxyToken);
    // } catch (e) {
    //   throw { status: 0 };
    // }

    // Post comment
    return this.pumpFunService.comment(
      commentTxt,
      mint,
      proxyToken,
      this.proxy
      // fileUri
    );
  }
}
