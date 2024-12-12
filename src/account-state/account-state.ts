import { AxiosError } from "axios";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "../constants";
import { ProxyRotator } from "../proxy/ProxyRotator";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import { generateUsername } from "../pump-fun/util";
import { createWallet } from "../solana/createWallet";
import chalk from "chalk";

export class AccountState {
  private state: string[] = [];
  private maxSize = 2000; // starting from 0.
  private currentIndex = 0;

  constructor(
    private proxyRotator: ProxyRotator,
    private pumpFunService: PumpFunService
  ) {
    this.loadAccounts();
  }

  get size(): number {
    return this.state.length;
  }

  get account(): string {
    const nextAccount = this.state[this.currentIndex];
    this.currentIndex++;
    return nextAccount;
  }

  addAccount(acc: string): void {
    this.state.push(acc);
  }

  async loadAccounts() {
    const concurrentLimit = 5; // Number of accounts to create in parallel

    while (this.size < this.maxSize) {
      const remainingSlots = this.maxSize - this.size;
      const batchSize = Math.min(concurrentLimit, remainingSlots);

      const accountPromises = Array.from({ length: batchSize }, async () => {
        try {
          const authCookie = await this.createAccount();
          this.addAccount(authCookie);
          console.log("Accounts:", this.size);
        } catch (e) {
          console.error("Error creating account, skipping...");
          // Handle errors appropriately, e.g., logging or retries
        }
      });

      await Promise.all(accountPromises);
    }
  }

  private async createAccount(): Promise<string> {
    // Login and get auth cookie
    const secretKey = createWallet().secretKeyBase58;
    let authCookie: string | null = null;
    try {
      authCookie = await this.pumpFunService.login(
        secretKey,
        this.proxyRotator.proxy
      );
      if (!authCookie) throw { status: 0 };
    } catch (e) {
      throw { status: 401 };
    }

    // Update profile
    try {
      await this.pumpFunService.updateProfile(
        {
          username: generateUsername(),
          profileImage: BOT_IMAGE_GIF,
          bio: BOT_DESCRIPTION,
        },
        authCookie,
        this.proxyRotator.proxy
      );
    } catch (e) {
      throw { status: 422 };
    }

    // Turn auth cookie into proxy-token (needed for comment header)
    let proxyToken: string | undefined;
    try {
      proxyToken = await this.pumpFunService.getProxyToken(authCookie);
    } catch (e) {
      const error = e as AxiosError;
      console.error(chalk.red("Error generating proxy-token."));
      throw { status: error.status || 403 };
    }

    return proxyToken;
  }
}
