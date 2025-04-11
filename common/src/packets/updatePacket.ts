import { EntityType, GameConstants } from "../constants";
import { type GameBitStream, type Packet } from "../net";
import { type Vector } from "../utils/vector";
import { PetalDefinition, Petals, SavedPetalDefinitionData } from "../definitions/petal";
import { MobDefinition, Mobs } from "../definitions/mob";
import { Projectile, ProjectileDefinition } from "../definitions/projectile";

export interface EntitiesNetData {
    [EntityType.Player]: {
        position: Vector
        direction: Vector
        state: {
            poisoned: boolean
            danded: boolean
        }

        full?: {
            healthPercent: number
        }
    }
    [EntityType.Petal]: {
        position: Vector
        definition: PetalDefinition
        isReloading: boolean
        ownerId: number

        full?: {

        }
    }
    [EntityType.Mob]: {
        position: Vector
        direction: Vector
        definition: MobDefinition

        full?: {
            healthPercent: number
        }
    }
    [EntityType.Loot]: {
        position: Vector
        definition: PetalDefinition

        full?: {

        }
    }
    [EntityType.Projectile]: {
        position: Vector
        definition: ProjectileDefinition
        direction: Vector

        full?: {

        }
    }
}

interface EntitySerialization<T extends EntityType> {
    // how many bytes to alloc for the entity serialized data cache
    partialSize: number
    fullSize: number
    serializePartial: (stream: GameBitStream, data: EntitiesNetData[T]) => void
    serializeFull: (stream: GameBitStream, data: Required<EntitiesNetData[T]>["full"]) => void
    deserializePartial: (stream: GameBitStream) => EntitiesNetData[T]
    deserializeFull: (stream: GameBitStream) => Required<EntitiesNetData[T]>["full"]
}

export const EntitySerializations: { [K in EntityType]: EntitySerialization<K> } = {
    [EntityType.Player]: {
        partialSize: 9,
        fullSize: 2,
        serializePartial(stream, data): void {
            stream.writePosition(data.position);
            stream.writeUnit(data.direction, 16);
            stream.writeBoolean(data.state.poisoned);
            stream.writeBoolean(data.state.danded)
        },
        serializeFull(stream, data): void {
            stream.writeFloat(data.healthPercent, 0.0, 1.0, 16);
        },
        deserializePartial(stream) {
            return {
                position: stream.readPosition(),
                direction: stream.readUnit(16),
                state: {
                    poisoned: stream.readBoolean(),
                    danded: stream.readBoolean()
                }
            };
        },
        deserializeFull(stream) {
            return {
                healthPercent: stream.readFloat(0.0, 1.0, 16)
            };
        }
    },
    [EntityType.Petal]: {
        partialSize: 8,
        fullSize: 0,
        serializePartial(stream, data): void {
            Petals.writeToStream(stream, data.definition);
            stream.writePosition(data.position);
            stream.writeBoolean(data.isReloading)
            stream.writeUint16(data.ownerId);
        },
        serializeFull(stream, data): void {

        },
        deserializePartial(stream) {
            return {
                definition: Petals.readFromStream(stream),
                position: stream.readPosition(),
                isReloading: stream.readBoolean(),
                ownerId: stream.readUint16()
            };
        },
        deserializeFull(stream) {
            return {};
        }
    },
    [EntityType.Mob]: {
        partialSize: 12,
        fullSize: 2,
        serializePartial(stream, data): void {
            Mobs.writeToStream(stream, data.definition);
            stream.writePosition(data.position);
            stream.writeUnit(data.direction, 16)
        },
        serializeFull(stream, data): void {
            stream.writeFloat(data.healthPercent, 0.0, 1.0, 16);
        },
        deserializePartial(stream) {
            return {
                definition: Mobs.readFromStream(stream),
                position: stream.readPosition(),
                direction: stream.readUnit(16)
            };
        },
        deserializeFull(stream) {
            return {
                healthPercent: stream.readFloat(0.0, 1.0, 16)
            };
        }
    },
    [EntityType.Loot]: {
        partialSize: 8,
        fullSize: 0,
        serializePartial(stream, data): void {
            Petals.writeToStream(stream, data.definition);
            stream.writePosition(data.position);
        },
        serializeFull(stream, data): void {

        },
        deserializePartial(stream) {
            return {
                definition: Petals.readFromStream(stream),
                position: stream.readPosition(),
            };
        },
        deserializeFull(stream) {
            return {};
        }
    },
    [EntityType.Projectile]: {
        partialSize: 10,
        fullSize: 0,
        serializePartial(stream, data): void {
            Projectile.writeToStream(stream, data.definition);
            stream.writePosition(data.position);
            stream.writeUnit(data.direction, 8);
        },
        serializeFull(stream, data): void {

        },
        deserializePartial(stream) {
            return {
                definition: Projectile.readFromStream(stream),
                position: stream.readPosition(),
                direction: stream.readUnit(8)
            };
        },
        deserializeFull(stream) {
            return {};
        }
    }
};

interface Entity {
    id: number
    type: EntityType
    data: EntitiesNetData[Entity["type"]]
}

export interface Explosion {
    position: Vector
    radius: number
}

enum UpdateFlags {
    DeletedEntities = 1 << 0,
    FullEntities = 1 << 1,
    PartialEntities = 1 << 2,
    NewPlayers = 1 << 3,
    DeletedPlayers = 1 << 4,
    PlayerData = 1 << 5,
    Map = 1 << 8
}

export class UpdatePacket implements Packet {
    deletedEntities: number[] = [];
    partialEntities: Entity[] = [];
    fullEntities: Array<Entity & { data: Required<EntitiesNetData[Entity["type"]]> }> = [];

    newPlayers: Array<{
        name: string
        id: number
    }> = [];

    deletedPlayers: number[] = [];

    playerDataDirty = {
        id: false,
        zoom: false,
        inventory: false
    };

    playerData: {
        id: number, zoom: number, inventory: SavedPetalDefinitionData[]
    } = {
        id: 0,
        zoom: 0,
        inventory: []
    };

    mapDirty = false;
    map = {
        width: 0,
        height: 0
    };

    // server side cached entity serializations
    serverPartialEntities: Array<{
        partialStream: GameBitStream
    }> = [];

    serverFullEntities: Array<{
        partialStream: GameBitStream
        fullStream: GameBitStream
    }> = [];

    serialize(stream: GameBitStream): void {
        let flags = 0;
        // save the stream index for writing flags
        const flagsIdx = stream.index;
        stream.writeUint16(flags);

        if (this.deletedEntities.length) {
            stream.writeArray(this.deletedEntities, 16, id => {
                stream.writeUint16(id);
            });

            flags |= UpdateFlags.DeletedEntities;
        }

        if (this.serverFullEntities.length) {
            stream.writeArray(this.serverFullEntities, 16, entity => {
                stream.writeBytes(entity.partialStream, 0, entity.partialStream.byteIndex);
                stream.writeBytes(entity.fullStream, 0, entity.fullStream.byteIndex);
            });

            flags |= UpdateFlags.FullEntities;
        }

        if (this.serverPartialEntities.length) {
            stream.writeArray(this.serverPartialEntities, 16, entity => {
                stream.writeBytes(entity.partialStream, 0, entity.partialStream.byteIndex);
            });

            flags |= UpdateFlags.PartialEntities;
        }

        if (this.newPlayers.length) {
            stream.writeArray(this.newPlayers, 8, player => {
                stream.writeUint16(player.id);
                stream.writeASCIIString(player.name, GameConstants.player.maxNameLength);
            });

            flags |= UpdateFlags.NewPlayers;
        }

        if (this.deletedPlayers.length) {
            stream.writeArray(this.deletedPlayers, 8, id => {
                stream.writeUint16(id);
            });

            flags |= UpdateFlags.DeletedPlayers;
        }

        if (Object.values(this.playerDataDirty).includes(true)) {
            stream.writeBoolean(this.playerDataDirty.id);
            if (this.playerDataDirty.id) {
                stream.writeUint16(this.playerData.id);
            }

            stream.writeBoolean(this.playerDataDirty.zoom);
            if (this.playerDataDirty.zoom) {
                stream.writeUint8(this.playerData.zoom);
            }

            stream.writeBoolean(this.playerDataDirty.inventory);
            if (this.playerDataDirty.inventory) {
                stream.writeArray(this.playerData.inventory, 8, (item) => {
                    stream.writeBoolean(item === null);
                    if (item) Petals.writeToStream(stream, item);
                })
            }
            stream.writeAlignToNextByte();

            flags |= UpdateFlags.PlayerData;
        }

        if (this.mapDirty) {
            stream.writeUint16(this.map.width);
            stream.writeUint16(this.map.height);

            flags |= UpdateFlags.Map;
        }

        // write flags and restore stream index
        const idx = stream.index;
        stream.index = flagsIdx;
        stream.writeUint16(flags);
        stream.index = idx;
    }

    deserialize(stream: GameBitStream): void {
        const flags = stream.readUint16();

        if (flags & UpdateFlags.DeletedEntities) {
            stream.readArray(this.deletedEntities, 16, () => {
                return stream.readUint16();
            });
        }

        if (flags & UpdateFlags.FullEntities) {
            stream.readArray(this.fullEntities, 16, () => {
                const id = stream.readUint16();
                const entityType = stream.readUint8() as EntityType;
                const data = EntitySerializations[entityType].deserializePartial(stream);
                stream.readAlignToNextByte();
                data.full = EntitySerializations[entityType].deserializeFull(stream);
                stream.readAlignToNextByte();
                return {
                    id,
                    type: entityType,
                    data
                };
            });
        }

        if (flags & UpdateFlags.PartialEntities) {
            stream.readArray(this.partialEntities, 16, () => {
                const id = stream.readUint16();
                const entityType = stream.readUint8() as EntityType;
                const data = EntitySerializations[entityType].deserializePartial(stream);
                stream.readAlignToNextByte();
                return {
                    id,
                    type: entityType,
                    data
                };
            });
        }

        if (flags & UpdateFlags.NewPlayers) {
            stream.readArray(this.newPlayers, 8, () => {
                return {
                    id: stream.readUint16(),
                    name: stream.readASCIIString(GameConstants.player.maxNameLength)
                };
            });
        }

        if (flags & UpdateFlags.DeletedPlayers) {
            stream.readArray(this.deletedPlayers, 8, () => {
                return stream.readUint16();
            });
        }

        if (flags & UpdateFlags.PlayerData) {
            if (stream.readBoolean()) {
                this.playerDataDirty.id = true;
                this.playerData.id = stream.readUint16();
            }

            if (stream.readBoolean()) {
                this.playerDataDirty.zoom = true;
                this.playerData.zoom = stream.readUint8();
            }

            if (stream.readBoolean()) {
                this.playerDataDirty.inventory = true;
                stream.readArray(this.playerData.inventory, 8, () => {
                    const isEmpty = stream.readBoolean();
                    if(!isEmpty) return Petals.readFromStream(stream);
                    return null;
                })
            }

            stream.readAlignToNextByte();
        }

        if (flags & UpdateFlags.Map) {
            this.mapDirty = true;
            this.map.width = stream.readUint16();
            this.map.height = stream.readUint16();
        }
    }
}
