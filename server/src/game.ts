import { type WebSocket } from "ws";
import { ServerPlayer } from "./entities/serverPlayer";
import {
    isCollideableEntity,
    isDamageableEntity,
    ServerEntity
} from "./entities/serverEntity";
import { Grid } from "./grid";
import { EntityPool } from "../../common/src/utils/entityPool";
import { EntityType, GameConstants } from "../../common/src/constants";
import NanoTimer from "nanotimer";
import { type ServerConfig } from "./config";
import { IDAllocator } from "./idAllocator";
import { Vec2, type Vector } from "../../common/src/utils/vector";
import { ServerMob } from "./entities/serverMob";
import { Mobs } from "../../common/src/definitions/mob";
import { CollisionResponse } from "../../common/src/utils/collision";
import { Random } from "../../common/src/utils/random";

export class Game {
    players = new EntityPool<ServerPlayer>();

    newPlayers: ServerPlayer[] = [];
    deletedPlayers: number[] = [];

    partialDirtyEntities = new Set<ServerEntity>();
    fullDirtyEntities = new Set<ServerEntity>();

    grid = new Grid(GameConstants.maxPosition, GameConstants.maxPosition);

    width = GameConstants.game.width;
    height = GameConstants.game.height;

    minVector = Vec2.new(0, 0);
    maxVector = Vec2.new(GameConstants.game.width, GameConstants.game.height);

    mapDirty = false;

    idAllocator = new IDAllocator(16);

    get nextEntityID(): number {
        return this.idAllocator.getNextId();
    }

    dt = 0;
    now = Date.now();

    private readonly timer = new NanoTimer();

    private readonly deltaMs: number;

    constructor(config: ServerConfig) {
        this.deltaMs = 1000 / config.tps;
        this.timer.setInterval(this.tick.bind(this), "", `${this.deltaMs}m`);
    }

    clampPosition(position: Vector, width: number, height: number){
        const maxVector = Vec2.sub(this.maxVector, Vec2.new(width, height));
        return Vec2.clampWithVector(
            position,
            Vec2.new(width, height),
            maxVector
        );
    }

    addPlayer(socket: WebSocket): ServerPlayer {
        const player = new ServerPlayer(this, socket);
        this.newPlayers.push(player);

        return player;
    }

    removePlayer(player: ServerPlayer): void {
        this.players.delete(player);
        player.destroy();
        this.deletedPlayers.push(player.id);
        console.log(`"${player.name}" left the game.`);
    }

    handleMessage(data: ArrayBuffer, player: ServerPlayer) {
        player.processMessage(data);
    }

    tick(): void {
        this.dt = (Date.now() - this.now) / 1000;
        this.now = Date.now();

        const activeEntities = new Set<ServerEntity>();

        // update entities
        for (const entity of this.grid.entities.values()) {
            if (entity.isActive()) activeEntities.add(entity);
            entity.tick();
        }

        const collisionTasks = new Set<CollisionTask>();

        for (const entity of activeEntities) {
            const collidedEntities =
                this.grid.intersectsHitbox(entity.hitbox);

            for (const collidedEntity of collidedEntities) {
                if (collidedEntity === entity) continue;
                if (!activeEntities.has(collidedEntity)) continue;

                const collision =
                    entity.hitbox.getIntersection(collidedEntity.hitbox);
                if (collision) {
                    if (isDamageableEntity(entity) && isDamageableEntity(collidedEntity)) {
                        entity.dealDamageTo(collidedEntity);
                    }

                    const task: CollisionTask = {
                        source: entity,
                        target: collidedEntity,
                        collision
                    }

                    const reversedTask: CollisionTask = {
                        source: collidedEntity,
                        target: entity,
                        collision
                    }

                    if (collisionTasks.has(task) || collisionTasks.has(reversedTask)) continue;

                    collisionTasks.add(task)
                }
            }
        }

        for (const collisionTask of collisionTasks) {
            const { source, target, collision } = collisionTask;
            if (collision && isCollideableEntity(source) && isCollideableEntity(target)) {
                const reversedCollision = {
                    dir: collision.dir,
                    pen: collision.pen * -1
                }

                source.collideWith(collision, target);
                target.collideWith(reversedCollision, source);
            }
        }

        // Cache entity serializations
        for (const entity of this.partialDirtyEntities) {
            if (this.fullDirtyEntities.has(entity)) {
                this.partialDirtyEntities.delete(entity);
                continue;
            }
            entity.serializePartial();
        }

        for (const entity of this.fullDirtyEntities) {
            entity.serializeFull();
        }

        // Second loop over players: calculate visible entities & send updates
        for (const player of this.players) {
            player.sendPackets();
        }

        // reset stuff
        for (const player of this.players) {
            for (const key in player.dirty) {
                player.dirty[key as keyof ServerPlayer["dirty"]] = false;
            }
        }

        this.partialDirtyEntities.clear();
        this.fullDirtyEntities.clear();
        this.newPlayers.length = 0;
        this.deletedPlayers.length = 0;
        this.mapDirty = false;

        if (this.grid.byCategory[EntityType.Mob].size <= 150) {
            const position = Random.vector(0, this.width, 0, this.height);
            if (Random.int(0, 100) <= 90) {
                new ServerMob(this, position,
                    Mobs.fromString("ladybug"));
            }else {
                new ServerMob(this, position,
                    Mobs.fromString("mega_ladybug"));
            }
        }
    }
}

interface CollisionTask {
    source: ServerEntity;
    target: ServerEntity;
    collision: CollisionResponse;
}
