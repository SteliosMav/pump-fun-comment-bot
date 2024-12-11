import bs58 from "bs58";
import bs64 from "base64-js";
import WebSocket from "ws";

// Pump.fun Program ID and WebSocket endpoint
const PUMP_PROGRAM = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const WSS_ENDPOINT = "wss://api.mainnet-beta.solana.com/"; // "wss://mainnet.helius-rpc.com/?api-key=ec9c2854-9910-4a8c-a83e-051aad09bea2";

const fields = [
  { name: "name", type: "string" },
  { name: "symbol", type: "string" },
  { name: "uri", type: "string" },
  { name: "mint", type: "publicKey" },
  { name: "bondingCurve", type: "publicKey" },
  { name: "user", type: "publicKey" },
];

/**
 * Parses the "Create" instruction data from the provided buffer.
 * @param {Buffer} data - Instruction data as a buffer.
 * @returns {Object|null} Parsed instruction or null if parsing fails.
 */
function parseCreateInstruction(data: any) {
  if (data.length < 8) {
    console.error("Data too short for parsing.");
    return null;
  }

  let offset = 8; // Skip the discriminator (first 8 bytes)
  const parsedData: any = {};

  try {
    for (const field of fields) {
      if (field.type === "string") {
        if (offset + 4 > data.length) {
          //   console.error("Insufficient data for string length.");
          return null;
        }

        const length = data.readUInt32LE(offset);
        offset += 4;

        if (offset + length > data.length) {
          //   console.error("Insufficient data for string content.");
          return null;
        }

        parsedData[field.name] = data
          .slice(offset, offset + length)
          .toString("utf-8");
        offset += length;
      } else if (field.type === "publicKey") {
        if (offset + 32 > data.length) {
          //   console.error("Insufficient data for public key.");
          return null;
        }

        const keyBytes = data.slice(offset, offset + 32);
        parsedData[field.name] = bs58.encode(keyBytes);
        offset += 32;
      }
    }
    return parsedData;
  } catch (error) {
    console.error(
      "Failed to parse create instruction:",
      (error as any).message
    );
    return null;
  }
}

/**
 * Processes log data and extracts relevant information.
 * @param {Object} logData - Log data from the WebSocket.
 */
function handleTransaction(logData: any, cbFn: Function) {
  //   console.log(`Signature: ${logData.signature}`);
  const logs = logData.logs || [];

  for (const log of logs) {
    if (log.startsWith("Program data:")) {
      try {
        const encodedData = log.split(": ")[1];
        const decodedData = Buffer.from(bs64.toByteArray(encodedData));
        const parsedData = parseCreateInstruction(decodedData);

        if (parsedData) {
          //   console.log("New Meme Coin Created!");
          //   for (const [key, value] of Object.entries(parsedData)) {
          //     console.log(`${key}: ${value}`);
          //   }
          cbFn(parsedData.mint);
        } else {
          //   console.error("Failed to parse create instruction.");
        }
      } catch (error) {
        console.error(`Error processing log: ${(error as any).message}`);
      }
    }
  }
}

/**
 * Starts listening for new token creations.
 */
export function listenForNewTokens(cbFn: Function) {
  const ws = new WebSocket(WSS_ENDPOINT);

  ws.on("open", () => {
    console.log(`Connected to WebSocket at ${WSS_ENDPOINT}`);
    const subscriptionMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "logsSubscribe",
      params: [{ mentions: [PUMP_PROGRAM] }, { commitment: "processed" }],
    });
    ws.send(subscriptionMessage);
    console.log(
      `Listening for new token creations from program: ${PUMP_PROGRAM}`
    );
  });

  ws.on("message", (message: any) => {
    try {
      const data = JSON.parse(message);
      if (data.method === "logsNotification") {
        const logData = data.params.result.value;
        const logs = logData.logs || [];

        if (
          logs.some((log: any) =>
            log.includes("Program log: Instruction: Create")
          )
        ) {
          handleTransaction(logData, cbFn);
        }
      }
    } catch (error) {
      console.error(
        `Error processing WebSocket message: ${(error as any).message}`
      );
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });

  ws.on("close", () => {
    console.warn("WebSocket connection closed. Reconnecting in 5 seconds...");
    setTimeout(listenForNewTokens, 5000);
  });
}
