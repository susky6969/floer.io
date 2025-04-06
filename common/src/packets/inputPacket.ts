import { type GameBitStream, type Packet } from "../net";
import { Vec2 } from "../utils/vector";
import { Petals, SavedPetalDefinitionData } from "../definitions/petal";

export class InputPacket implements Packet {
    direction = Vec2.new(0, 0);
    mouseDistance: number = 0;
    isAttacking = false;
    isDefending = false;
    switchedPetalIndex = -1;
    switchedToPetalIndex = -1;
    deletedPetalIndex: number = -1;

    serialize(stream: GameBitStream): void {
        stream.writeBoolean(this.isAttacking);
        stream.writeBoolean(this.isDefending);
        stream.writeUnit(this.direction, 16);
        stream.writeUint8(this.mouseDistance);

        stream.writeUint8(this.switchedPetalIndex);
        stream.writeUint8(this.switchedToPetalIndex);
        stream.writeUint8(this.deletedPetalIndex);
    }

    deserialize(stream: GameBitStream): void {
        this.isAttacking = stream.readBoolean();
        this.isDefending = stream.readBoolean();
        this.direction = stream.readUnit(16);
        this.mouseDistance = stream.readUint8();

        this.switchedPetalIndex = stream.readUint8();
        this.switchedToPetalIndex = stream.readUint8();
        this.deletedPetalIndex = stream.readUint8();
    }
}
