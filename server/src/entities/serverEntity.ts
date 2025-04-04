import { type GameEntity } from "../../../common/src/utils/entityPool";
import { EntityType } from "../../../common/src/constants";
import { GameBitStream } from "../../../common/src/net";
import { type EntitiesNetData, EntitySerializations } from "../../../common/src/packets/updatePacket";
import { type Hitbox } from "../../../common/src/utils/hitbox";
import { type Vector } from "../../../common/src/utils/vector";
import { type Game } from "../game";
import { ServerPlayer } from "./serverPlayer";
import { ServerPetal } from "./serverPetal";
import { ServerMob } from "./serverMob";

type damageableEntity = ServerPetal | ServerPlayer | ServerMob

export function isDamageableEntity(entity: ServerEntity): entity is damageableEntity {
    return entity.type === EntityType.Petal
        ||  entity.type === EntityType.Player
        || entity.type === EntityType.Mob;
}

export abstract class ServerEntity<T extends EntityType = EntityType> implements GameEntity{
    abstract type: T;
    game: Game;
    id: number;

    _position: Vector;
    _oldPosition?: Vector;

    hasInited: boolean = false;

    get position(): Vector { return this._position; }
    set position(pos: Vector) { this._position = pos; }

    abstract hitbox: Hitbox;

    partialStream!: GameBitStream;
    fullStream!: GameBitStream;

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.id = game.nextEntityID;
        this._position = pos;
    }

    abstract tick(): void;

    init(): void {
        // + 3 for entity id (2 bytes) and entity type (1 byte)
        this.partialStream = GameBitStream.create(EntitySerializations[this.type].partialSize + 3);
        this.fullStream = GameBitStream.create(EntitySerializations[this.type].fullSize);
        this.serializeFull();
        this.hasInited = true;
    }

    serializePartial(): void {
        this.partialStream.index = 0;
        this.partialStream.writeUint16(this.id);
        this.partialStream.writeUint8(this.type);
        EntitySerializations[this.type].serializePartial(this.partialStream, this.data as EntitiesNetData[typeof this.type]);
        this.partialStream.writeAlignToNextByte();
    }

    serializeFull(): void {
        this.serializePartial();
        this.fullStream.index = 0;
        EntitySerializations[this.type].serializeFull(this.fullStream, this.data.full);
        this.fullStream.writeAlignToNextByte();
    }

    setDirty(): void {
        if (!this.hasInited) return;
        this.game.partialDirtyEntities.add(this);
    }

    setFullDirty(): void {
        if (!this.hasInited) return;
        this.game.fullDirtyEntities.add(this);
    }

    abstract get data(): Required<EntitiesNetData[EntityType]>;

    destroy(): void {
        this.tick();
        this.game.grid.remove(this);
    }
}
