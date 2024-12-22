import { isAxiosError } from "axios";
import { TokenCreationEvent } from "../../listeners/pump-fun-portal-listener";
import { ProxyRotator } from "../../proxy/proxy-rotator";
import { PumpFunService } from "../../pump-fun/pump-fun.service";
import chalk from "chalk";
import { BasicController } from "../basic.controller";
import { AccountGenerator } from "../../account-generator/account-generator";
import { COMMENT_MODE, DELAYS } from "../../config";
import { CommentGenerator } from "../../comment-generator/comment-generator";
import { ExceptionFilter } from "../exception-filter";

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
    // Run checks
    const errMsg = this.runChecks(event);
    if (errMsg) {
      console.log(chalk.yellow("Event skipped:", errMsg));
      return;
    }

    const validEvent = event as TokenCreationEvent & { mint: string };

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

  private runChecks(event: TokenCreationEvent): null | string {
    if (!event.mint) {
      return "No mint provided";
    }
    if (!this.accGen.hasSufficientAccounts) {
      return "Not enough accounts";
    }
    return null;
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
      ExceptionFilter(e);
    }

    this.proxy = this.proxyRotator.proxy;
  }
}
