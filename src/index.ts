import { tokenCreationController } from "./controllers/token-created-controller";
import { connect } from "./listener/pump-fun-portal-listener";

// Initiate the WebSocket connection
connect(tokenCreationController);
