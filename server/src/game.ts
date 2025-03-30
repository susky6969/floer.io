import { type WebSocket } from "ws";
import { Player } from "./entities/player";
import { type ServerEntity } from "./entities/serverEntity";
import { Grid } from "./grid";
import { EntityPool } from "@common/utils/entityPool";
import { GameConstants } from "@common/constants";
import NanoTimer from "nanotimer";
import { type ServerConfig } from "./config";
import { type Explosion } from "@common/packets/updatePacket";
import { IDAllocator } from "./idAllocator";
import { type Vector } from "@common/utils/vector";

export class Game {
    players = new EntityPool<Player>();

    newPlayers: Player[] = [];
    deletedPlayers: number[] = [];

    partialDirtyEntities = new Set<ServerEntity>();
    fullDirtyEntities = new Set<ServerEntity>();

    explosions: Explosion[] = [];
    shots: Vector[] = [];

    grid = new Grid(GameConstants.maxPosition, GameConstants.maxPosition);

    width = 128;
    height = 128;
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

    addPlayer(socket: WebSocket): Player {
        const player = new Player(this, socket);
        this.newPlayers.push(player);
        return player;
    }

    removePlayer(player: Player): void {
        this.players.delete(player);
        this.grid.remove(player);
        this.deletedPlayers.push(player.id);
        console.log(`"${player.name}" left the game.`);
    }

    handleMessage(data: ArrayBuffer, player: Player) {
        player.processMessage(data);
    }

    tick(): void {
        this.dt = (Date.now() - this.now) / 1000;
        this.now = Date.now();

        // update entities
        for (const entity of this.grid.entities.values()) {
            entity.tick();
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
                player.dirty[key as keyof Player["dirty"]] = false;
            }
        }

        this.partialDirtyEntities.clear();
        this.fullDirtyEntities.clear();
        this.newPlayers.length = 0;
        this.deletedPlayers.length = 0;
        this.explosions.length = 0;
        this.shots.length = 0;
        this.mapDirty = false;
    }
}
