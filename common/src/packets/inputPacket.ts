import { type GameBitStream, type Packet } from "../net";
import { Vec2 } from "../utils/vector";

export class InputPacket implements Packet {
    direction = Vec2.new(0, 0);
    isAttacking = false;
    isDefending = false;

    serialize(stream: GameBitStream): void {
        stream.writeBoolean(this.isAttacking);
        stream.writeBoolean(this.isDefending);
        stream.writeUnit(this.direction, 16);
    }

    deserialize(stream: GameBitStream): void {
        this.isAttacking = stream.readBoolean();
        this.isDefending = stream.readBoolean();
        this.direction = stream.readUnit(16);
    }
}
