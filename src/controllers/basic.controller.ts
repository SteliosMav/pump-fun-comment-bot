import { TokenCreationEvent } from "../listener/pump-fun-portal-listener";

export abstract class BasicController {
  handleEvent(event: TokenCreationEvent) {}
}
