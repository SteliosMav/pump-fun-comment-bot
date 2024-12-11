import { TokenCreatedController } from "./controllers/token-created-controller/token-created-controller";
import { connect } from "./listener/pump-fun-portal-listener";

// Initialize controller
const tokenCreatedController = new TokenCreatedController();

// Initiate the WebSocket connection
connect(tokenCreatedController);
