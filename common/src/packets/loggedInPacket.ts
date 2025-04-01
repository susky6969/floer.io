import { type GameBitStream, type Packet } from "../net";
import { PetalDefinition, Petals } from "../definitions/petal";

export class LoggedInPacket implements Packet {
    equiped_petals: PetalDefinition[] = [];

    serialize(stream: GameBitStream): void {
        stream.writeArray(this.equiped_petals, 8, (def) => {
            Petals.writeToStream(stream, def);
        })
    }

    deserialize(stream: GameBitStream): void {
        stream.readArray(this.equiped_petals, 8, () => {
            return Petals.readFromStream(stream);
        })
    }
}
