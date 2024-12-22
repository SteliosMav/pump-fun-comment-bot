import { TokenCreationEvent } from "../listeners/pump-fun-portal-listener";

export abstract class BasicController {
  handleEvent(event: TokenCreationEvent) {}
}
