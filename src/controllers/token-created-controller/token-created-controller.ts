import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { TokenCreationEvent } from "../../listener/pump-fun-portal-listener";
import { ProxyRotator } from "../../proxy/ProxyRotator";
import { PumpFunService } from "../../pump-fun/pump-fun.service";
import chalk from "chalk";
import { BasicController } from "../basic.controller";
import { AccountGenerator } from "../../account-generator/account-generator";
import { COMMENT_MODE, DELAYS } from "../../config";
import { CommentGenerator } from "../../comment-generator/comment-generator";

export class TokenCreatedController implements BasicController {
  private proxy = this.proxyRotator.proxy; // rotate through proxies
  private commentsCounter = 0; // used for data analysis

  constructor(
    private proxyRotator: ProxyRotator,
    private pumpFunService: PumpFunService,
    private commentGenerator: CommentGenerator,
    private accGen: AccountGenerator
  ) {
    accGen.load();
  }

  handleEvent(event: TokenCreationEvent) {
    const validEvent = this.isValid(event);

    // Run checks
    if (!validEvent) return;
    if (!this.accGen.remainingSlots) return;

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
      await this.pumpFunService.comment(
        this.commentGenerator.comment,
        mint,
        this.accGen.account,
        this.proxy
      );
      this.commentsCounter++;
      console.log(
        chalk.green(
          `Comment on "${mint}" succeeded at! Counter: ${this.commentsCounter}`
        )
      );
    } catch (e) {
      if (isAxiosError(e)) {
        console.log(
          chalk.red(
            `Error while commenting. Status ${e.status}: ${e.response?.statusText}`
          )
        );
      } else {
        console.error(chalk.red("Non-Axios error:"), e);
      }
    }

    this.proxy = this.proxyRotator.proxy;
  }

  private isValid(
    event: TokenCreationEvent
  ): (TokenCreationEvent & { mint: string }) | null {
    // Validation logic
    if (!event.mint) return null;

    // Ensure "mint" is a string
    return { ...event, mint: event.mint };
  }
}
