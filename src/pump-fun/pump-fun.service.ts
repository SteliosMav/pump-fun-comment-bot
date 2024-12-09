import { Keypair } from "@solana/web3.js";
import { PUMP_FUN_API } from "../constants";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { UpdateProfileDTO } from "./types";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent"; // Use https-proxy-agent
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import chalk from "chalk";
import * as fs from "fs";
import FormData from "form-data";

export enum TransactionMode {
  Simulation,
  Execution,
}

export class PumpFunService {
  private _baseUrl = PUMP_FUN_API;
  private _pumpFunHeaders = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.pump.fun/",
    Origin: "https://www.pump.fun",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  constructor() {}

  async login(privateKey: string, proxy: string): Promise<string> {
    // Step 1: Initialize keypair from the private key
    const secretKey = bs58.decode(privateKey); // Decode the base58 private key
    const keypair = Keypair.fromSecretKey(secretKey);

    // Step 2: Generate a timestamp and create the sign-in message
    const timestamp = Date.now();
    const message = `Sign in to pump.fun: ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);

    // Step 3: Sign the message using tweetnacl
    const signatureUint8Array = nacl.sign.detached(
      encodedMessage,
      keypair.secretKey
    );
    const signature = bs58.encode(signatureUint8Array); // Encode signature in base58

    // Step 4: Prepare the payload
    const payload = {
      address: keypair.publicKey.toBase58(),
      signature: signature,
      timestamp: timestamp,
    };

    // Step 5: Configure Axios with proxy agent
    const agent = new HttpsProxyAgent(proxy);
    const config: AxiosRequestConfig = {
      method: "POST",
      url: `${this._baseUrl}/auth/login`,
      headers: this._pumpFunHeaders,
      data: payload,
      httpsAgent: agent, // Proxy support
    };

    // Step 6: Send the login request
    const response = await axios(config);

    // Get the set-cookie header from the response
    const setCookieHeader = response.headers["set-cookie"]![0];
    return setCookieHeader;
  }

  async updateProfile(
    payload: UpdateProfileDTO,
    authCookie: string,
    proxy: string
  ): Promise<AxiosResponse> {
    // Step 1: Configure Axios with proxy agent
    const agent = new HttpsProxyAgent(proxy);
    const config: AxiosRequestConfig = {
      method: "POST",
      url: `${this._baseUrl}/users`,
      headers: {
        ...this._pumpFunHeaders,
        Cookie: authCookie, // Add the auth cookie to the headers
      },
      data: { ...payload },
      httpsAgent: agent, // Proxy support
    };

    // Step 2: Send the request
    return axios(config);
  }

  async getProxyToken(authCookie: string): Promise<string> {
    const url = "https://frontend-api.pump.fun/token/generateTokenForThread";

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie, // Pass the auth token
      },
      withCredentials: true, // Ensure cookies are sent
    });

    return response.data.token; // Return the token
  }

  async comment(
    text: string,
    mint: string,
    proxyToken: string,
    proxy: string,
    fileUri: string
  ): Promise<AxiosResponse> {
    const commentUrl = `https://client-proxy-server.pump.fun/comment`;
    const payload = {
      text,
      mint,
      // fileUri:
      //   "https://ipfs.io/ipfs/QmSv7CHohQU36VdgAKA1wFx5Q71xPFAyTbf5izfiMaj8Wb",
      // "https://ipfs.io/ipfs/QmU2eoHt1ird9iXRrmcaEvexMBpVx3hZ3ebzvP5GJS4n9v",
      // "https://plum-near-goat-819.mypinata.cloud/ipfs/QmUY5WJiwfz62xX8yswwqjEJEZ6K4MieQVGJez3iwqaSZz?img-width=800&img-dpr=2&img-onerror=redirect",
    };
    if (fileUri) {
      (payload as any).fileUri = fileUri;
    }
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      // "content-length": Buffer.byteLength(
      //   JSON.stringify(payload),
      //   "utf-8"
      // ).toString(),
      "content-type": "application/json",
      origin: "https://pump.fun",
      priority: "u=1, i",
      referer: "https://pump.fun/",
      "sec-ch-ua":
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "x-aws-proxy-token": proxyToken,
    };
    const agent = new HttpsProxyAgent(proxy);
    const config: AxiosRequestConfig = {
      method: "POST",
      url: commentUrl,
      headers,
      data: payload,
      httpsAgent: agent, // Add proxy support
    };

    return axios(config);
  }

  async uploadImageToIPFS(authCookie: string) {
    const url = "https://pump.fun/api/ipfs-file";

    // Prepare headers
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      cookie: authCookie,
      origin: "https://pump.fun",
      referer:
        "https://pump.fun/coin/6VabzsMTG4jrDftU4xVGiNaPMaJm6SsgttF8iacHpump",
      "sec-ch-ua":
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    };

    // Create form-data with the image file
    const formData = new FormData();
    formData.append(
      "file",
      fs.createReadStream("./images/test-19.jpg"),
      "test-19.jpg"
    );

    // Merge form-data headers with custom headers
    const combinedHeaders = {
      ...headers,
      ...formData.getHeaders(),
    };

    try {
      // Make the POST request
      const response = await axios.post(url, formData, {
        headers: combinedHeaders,
      });

      if (response.status === 200) {
        return response.data.fileUri;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}
