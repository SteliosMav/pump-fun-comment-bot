import { listenForNewTokens } from "./src/listeners/main-net-listener";

listenForNewTokens((mint: string) => {
  console.log("####mint:", mint);
});
