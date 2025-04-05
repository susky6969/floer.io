import { type GameBitStream, type Packet } from "../net";
import { Vec2 } from "../utils/vector";
import { Petals, SavedPetalDefinitionData } from "../definitions/petal";

export class InputPacket implements Packet {
    direction = Vec2.new(0, 0);
    mouseDistance: number = 0;
    isAttacking = false;
    isDefending = false;
    equipped_petals: SavedPetalDefinitionData[] = []

    serialize(stream: GameBitStream): void {
        stream.writeBoolean(this.isAttacking);
        stream.writeBoolean(this.isDefending);
        stream.writeUnit(this.direction, 16);
        stream.writeUint8(this.mouseDistance);
        stream.writeArray(this.equipped_petals, 8, (item) => {
            stream.writeBoolean(item === null);
            if (item) Petals.writeToStream(stream, item);
        })
    }

    deserialize(stream: GameBitStream): void {
        this.isAttacking = stream.readBoolean();
        this.isDefending = stream.readBoolean();
        this.direction = stream.readUnit(16);
        this.mouseDistance = stream.readUint8();
        stream.readArray(this.equipped_petals, 8, () => {
            const isEmpty = stream.readBoolean();
            if(!isEmpty) return Petals.readFromStream(stream);
            return null;
        })
    }
}
