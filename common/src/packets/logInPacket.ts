import { type GameBitStream, type Packet } from "../net";
import { GameConstants } from "../constants";

export class LogInPacket implements Packet {
    token = "";

    serialize(stream: GameBitStream): void {
        stream.writeASCIIString(this.token, GameConstants.maxTokenLength);
    }

    deserialize(stream: GameBitStream): void {
        this.token = stream.readASCIIString(GameConstants.maxTokenLength);
    }
}
