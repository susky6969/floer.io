import { type GameEntity } from "../../../common/src/utils/entityPool";
import { EntityType } from "../../../common/src/constants";
import { GameBitStream } from "../../../common/src/net";
import { type EntitiesNetData, EntitySerializations } from "../../../common/src/packets/updatePacket";
import { CircleHitbox, type Hitbox } from "../../../common/src/utils/hitbox";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type Game } from "../game";
import { ServerPlayer } from "./serverPlayer";
import { ServerPetal } from "./serverPetal";
import { ServerMob } from "./serverMob";
import { CollisionResponse } from "../../../common/src/utils/collision";
import { MathGraphics } from "../../../common/src/utils/math";

export type collideableEntity = ServerPetal | ServerPlayer | ServerMob;

export type damageableEntity = ServerPetal | ServerPlayer | ServerMob;

export function isCollideableEntity(entity: ServerEntity): entity is collideableEntity {
    return entity.type === EntityType.Petal
        || entity.type === EntityType.Player
        || entity.type === EntityType.Mob;
}

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
    destroyed: boolean = false;

    get position(): Vector {
        return this._position;
    }
    set position(pos: Vector) {
        this.updatePosition(pos);
    }

    abstract hitbox: Hitbox;

    partialStream!: GameBitStream;
    fullStream!: GameBitStream;

    weight: number = 1;
    elasticity: number = 1;

    canReceiveDamageFrom(entity: ServerEntity): boolean {
        return !(this === entity);
    }

    isActive(): boolean {
        return !this.destroyed;
    }

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

    setPositionSafe(position: Vector) {
        if (!this.isActive()) return;
        this.updatePosition(position);
    }

    updatePosition(position: Vector): Vector | undefined {
        if (this._oldPosition && this._oldPosition == position) return;

        if (this.hitbox instanceof CircleHitbox) {
            this.hitbox.position = this.game.clampPosition(
                position, this.hitbox.radius, this.hitbox.radius
            );
            this._position = this.hitbox.position;
        }else {
            this._position = position;
        }

        if (!this.hasInited) return;
        if (this.destroyed) return;

        this.setDirty();
        this.game.grid.updateEntity(this);
    }

    collideWith(collision: CollisionResponse, entity: damageableEntity): void{
        if (entity.id === this.id) return;
        if (collision) {
            if (entity.type === this.type) {
                this.position = Vec2.sub(
                    this.position,
                    Vec2.mul(collision.dir, collision.pen)
                );
            } else {
                this.position = Vec2.sub(
                    this.position,
                    Vec2.mul(collision.dir, collision.pen * entity.elasticity / this.weight)
                );
            }
        }
    }

    abstract get data(): Required<EntitiesNetData[EntityType]>;

    destroy(): void {
        this.destroyed = true;
        this.game.grid.remove(this);
    }
}
