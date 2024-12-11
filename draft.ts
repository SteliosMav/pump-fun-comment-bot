import { listenForNewTokens } from "./src/listener/main-net-listener";

listenForNewTokens((mint: string) => {
  console.log("####mint:", mint);
});
