import WebSocket from "ws";
import { BasicController } from "../controllers/basic.controller";

export interface TokenCreationEvent {
  signature: string; // Unique signature of the transaction
  mint?: string; // Unique identifier for the token
  traderPublicKey: string; // Public key of the trader
  txType: "create"; // Transaction type (always 'create' for token creation)
  initialBuy: number; // Initial amount of tokens purchased
  bondingCurveKey: string; // Identifier for the bonding curve associated with the token
  vTokensInBondingCurve: number; // Total number of virtual tokens in the bonding curve
  vSolInBondingCurve: number; // Total number of virtual SOL in the bonding curve
  marketCapSol: number; // Market capitalization of the token in SOL
  name: string; // Token name
  symbol: string; // Token symbol
  uri: string; // URI pointing to token metadata
}

// Track active connection
let activeConnection: WebSocket | null = null;

export function connect(controller: BasicController) {
  if (activeConnection) {
    console.log("Connection already active, skipping new connection.");
    return;
  }

  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  activeConnection = ws;

  ws.on("open", () => {
    console.log("Connected to PumpPortal WebSocket");
    // Subscribe to new token creations
    const payload = { method: "subscribeNewToken" }; // Updated method for subscription
    ws.send(JSON.stringify(payload));
  });

  ws.on("message", async (data) => {
    const message: TokenCreationEvent = JSON.parse(data.toString());
    controller.handleEvent(message);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
    restart(ws, controller);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
    restart(ws, controller);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    restart(ws, controller); // Exit after logging
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    restart(ws, controller);
  });
}

async function restart(ws: WebSocket, controller: BasicController) {
  if (ws && ws.readyState !== WebSocket.CLOSED) {
    console.log("Closing existing WebSocket connection...");
    ws.terminate();
  }

  activeConnection = null; // Reset active connection
  console.log("Restarting WebSocket connection in 5 seconds...");
  setTimeout(() => connect(controller), 5000); // Restart after a delay
}
