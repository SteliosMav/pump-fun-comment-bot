import { AccountGenerator } from "./account-generator/account-generator";
import { CommentGenerator } from "./comment-generator/comment-generator";
import { TokenCreatedController } from "./controllers/token-created-controller/token-created-controller";
import { DependencyContainer } from "./dependency-container/dependency-container";
import { connect } from "./listeners/pump-fun-portal-listener";
import { ProxyRotator } from "./proxy/proxy-rotator";
import { PumpFunService } from "./pump-fun/pump-fun.service";

const container = new DependencyContainer();

// Register dependencies
container.register(new ProxyRotator());
container.register(new PumpFunService());
container.register(new CommentGenerator());
container.register(
  new AccountGenerator(
    container.resolve(ProxyRotator),
    container.resolve(PumpFunService)
  )
);

// Resolve dependencies
const tokenCreatedController = new TokenCreatedController(
  container.resolve(ProxyRotator),
  container.resolve(PumpFunService),
  container.resolve(CommentGenerator),
  container.resolve(AccountGenerator)
);

// Initiate the WebSocket connection
connect(tokenCreatedController);
