import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export function createWallet() {
  // Generate a new random keypair
  const newKeypair = Keypair.generate();

  const publicKey = newKeypair.publicKey.toBase58();
  const secretKey = [...newKeypair.secretKey];
  const secretKeyBase58 = bs58.encode(Uint8Array.from(secretKey));

  const walletData = {
    publicKey: publicKey,
    secretKey: secretKey,
    secretKeyBase58: secretKeyBase58,
  };

  return walletData;
}
