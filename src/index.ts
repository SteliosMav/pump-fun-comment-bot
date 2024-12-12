import { AccountState } from "./account-state/account-state";
import { TokenCreatedController } from "./controllers/token-created-controller/token-created-controller";
import { DependencyContainer } from "./dependency-container/dependency-container";
import { connect } from "./listener/pump-fun-portal-listener";
import { ProxyRotator } from "./proxy/ProxyRotator";
import { ROTATING_PROXY_LIST } from "./proxy/rotating_proxy-list";
import { PumpFunService } from "./pump-fun/pump-fun.service";

const container = new DependencyContainer();

// Register dependencies
container.register(new ProxyRotator(ROTATING_PROXY_LIST));
container.register(new PumpFunService());
container.register(
  new AccountState(
    container.resolve(ProxyRotator),
    container.resolve(PumpFunService)
  )
);

// Resolve dependencies
const tokenCreatedController = new TokenCreatedController(
  container.resolve(ProxyRotator),
  container.resolve(PumpFunService),
  container.resolve(AccountState)
);

// Initiate the WebSocket connection
connect(tokenCreatedController);
