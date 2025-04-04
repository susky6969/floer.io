import { type GameBitStream, type Packet } from "../net";
import { Vec2 } from "../utils/vector";

export class InputPacket implements Packet {
    direction = Vec2.new(0, 0);
    mouseDistance: number = 0;
    isAttacking = false;
    isDefending = false;

    serialize(stream: GameBitStream): void {
        stream.writeBoolean(this.isAttacking);
        stream.writeBoolean(this.isDefending);
        stream.writeUnit(this.direction, 16);
        stream.writeUint8(this.mouseDistance);
    }

    deserialize(stream: GameBitStream): void {
        this.isAttacking = stream.readBoolean();
        this.isDefending = stream.readBoolean();
        this.direction = stream.readUnit(16);
        this.mouseDistance = stream.readUint8();
    }
}
