import { AxiosError } from "axios";
import { BOT_DESCRIPTION, BOT_IMAGE_GIF } from "../constants";
import { ProxyRotator } from "../proxy/ProxyRotator";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import { generateUsername } from "../pump-fun/util";
import { createWallet } from "../solana/createWallet";
import chalk from "chalk";
import {
  CONCURRENT_ACCOUNT_CREATION,
  ACCOUNTS_AHEAD,
  PROFILE_FIELDS_TO_UPDATE,
} from "../config";

export class AccountState {
  private state: string[] = [];
  private minAccountsAhead = ACCOUNTS_AHEAD.min;
  private maxAccountsAhead = ACCOUNTS_AHEAD.max;
  private currentIndex = 0;
  private isLoadingAccounts = false;

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

    if (this.remainingSlots <= this.minAccountsAhead) {
      this.loadAccounts();
    }

    return nextAccount;
  }

  get remainingSlots(): number {
    return this.size + 1 - (this.currentIndex + 1);
  }

  addAccount(acc: string): void {
    this.state.push(acc);
  }

  async loadAccounts() {
    if (this.isLoadingAccounts) return;
    this.isLoadingAccounts = true;

    const concurrentLimit = CONCURRENT_ACCOUNT_CREATION;
    while (this.remainingSlots <= this.maxAccountsAhead) {
      const accountPromises = Array.from(
        { length: concurrentLimit },
        async () => {
          try {
            const authCookie = await this.createAccount();
            this.addAccount(authCookie);
          } catch (e) {
            console.error("Error creating account, skipping...");
            // Handle errors appropriately, e.g., logging or retries
          }
        }
      );

      await Promise.all(accountPromises);
    }

    this.isLoadingAccounts = false;
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
    if (PROFILE_FIELDS_TO_UPDATE.length) {
      try {
        await this.pumpFunService.updateProfile(
          {
            username: generateUsername(),
            profileImage: PROFILE_FIELDS_TO_UPDATE.includes("image")
              ? BOT_IMAGE_GIF
              : "",
            bio: PROFILE_FIELDS_TO_UPDATE.includes("bio")
              ? BOT_DESCRIPTION
              : "",
          },
          authCookie,
          this.proxyRotator.proxy
        );
      } catch (e) {
        throw { status: 422 };
      }
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
