import { type WebSocket } from "ws";
import { ServerEntity } from "./serverEntity";
import { Vec2, type Vector } from "@common/utils/vector";
import { GameBitStream, type Packet, PacketStream } from "@common/net";
import { type Game } from "@/game";
import { UpdatePacket, type EntitiesNetData } from "@common/packets/updatePacket";
import { CircleHitbox, RectHitbox } from "@common/utils/hitbox";
import { Random } from "@common/utils/random";
import { Numeric } from "@common/utils/math";
import { InputPacket } from "@common/packets/inputPacket";
import { JoinPacket } from "@common/packets/joinPacket";
import { EntityType, GameConstants } from "@common/constants";
import { GameOverPacket } from "@common/packets/gameOverPacket";
import { Inventory } from "@/inventory/inventory";

export class Player extends ServerEntity {
    readonly type = EntityType.Player;
    socket: WebSocket;
    name = "";
    direction = Vec2.new(0, 0);
    mouseDown = false;
    shoot = false;
    shotCooldown = 0;
    inventory = new Inventory(this);

    hitbox = new CircleHitbox(GameConstants.player.radius);

    private _health = GameConstants.player.defaultHealth;

    get health(): number {
        return this._health;
    }

    set health(health: number) {
        if (health === this._health) return;
        this._health = Numeric.clamp(health, 0, GameConstants.player.maxHealth);
        this.setFullDirty();
    }

    dead = false;

    kills = 0;

    firstPacket = true;

    /**
    * Entities the player can see
    */
    visibleEntities = new Set<ServerEntity>();

    // what needs to be sent again to the client
    readonly dirty = {
        id: true,
        zoom: true
    };

    private _zoom = 64;

    get zoom(): number {
        return this._zoom;
    }

    set zoom(zoom: number) {
        if (this._zoom === zoom) return;
        this._zoom = zoom;
        this.dirty.zoom = true;
    }

    get position(): Vector {
        return this.hitbox.position;
    }

    set position(pos: Vector) {
        this.hitbox.position = pos;
        this._position = pos;
    }

    constructor(game: Game, socket: WebSocket) {
        const pos = Random.vector(0, game.width, 0, game.height);
        super(game, pos);
        this.position = pos;
        this.socket = socket;
    }

    tick(): void {
        const oldPos = Vec2.clone(this.position);
        if (this.mouseDown) {
            const speed = Vec2.mul(this.direction, GameConstants.player.speed);
            this.position = Vec2.add(this.position, Vec2.mul(speed, this.game.dt));
        }

        const entities = this.game.grid.intersectsHitbox(this.hitbox);

        for (const entity of entities) {
            if (!(entity instanceof Player)) continue;
            if (entity === this) continue;

            const collision = this.hitbox.getIntersection(entity.hitbox);
            if (collision) {
                this.position = Vec2.sub(this.position, Vec2.mul(collision.dir, collision.pen));
            }
        }

        const rad = this.hitbox.radius;
        this.position.x = Numeric.clamp(this.position.x, rad, this.game.width - rad);
        this.position.y = Numeric.clamp(this.position.y, rad, this.game.height - rad);

        if (!Vec2.equals(this.position, oldPos)) {
            this.setDirty();
            this.game.grid.updateEntity(this);
        }
    }

    damage(amount: number, source: Player) {
        this.health -= amount;

        if (this.health <= 0) {
            this.dead = true;
            this.game.grid.remove(this);

            source.kills++;

            const gameOverPacket = new GameOverPacket();
            gameOverPacket.kills = this.kills;
            this.sendPacket(gameOverPacket);

            this.game.explosions.push({
                position: this.position,
                radius: 25
            });
        }
    }

    sendPackets() {
        // calculate visible, deleted, and dirty entities
        // and send them to the client
        const updatePacket = new UpdatePacket();

        const radius = this.zoom + 10;
        const rect = RectHitbox.fromCircle(radius, this.position);
        const newVisibleEntities = this.game.grid.intersectsHitbox(rect);

        for (const entity of this.visibleEntities) {
            if (!newVisibleEntities.has(entity)) {
                updatePacket.deletedEntities.push(entity.id);
            }
        }

        for (const entity of newVisibleEntities) {
            if (!this.visibleEntities.has(entity)) {
                updatePacket.serverFullEntities.push(entity);
            }
        }

        for (const entity of this.game.fullDirtyEntities) {
            if (newVisibleEntities.has(entity)
                && !updatePacket.serverFullEntities.includes(entity)
                && !updatePacket.deletedEntities.includes(entity.id)) {
                updatePacket.serverFullEntities.push(entity);
            }
        }

        for (const entity of this.game.partialDirtyEntities) {
            if (newVisibleEntities.has(entity)
                && !updatePacket.serverFullEntities.includes(entity)
                && !updatePacket.deletedEntities.includes(entity.id)) {
                updatePacket.serverPartialEntities.push(entity);
            }
        }
        this.visibleEntities = newVisibleEntities;

        updatePacket.playerData = this;
        updatePacket.playerDataDirty = this.dirty;

        updatePacket.newPlayers = this.firstPacket ? [...this.game.players] : this.game.newPlayers;
        updatePacket.deletedPlayers = this.game.deletedPlayers;

        for (const explosion of this.game.explosions) {
            if (rect.isPointInside(explosion.position)) {
                updatePacket.explosions.push(explosion);
            }
        }
        for (const shoot of this.game.shots) {
            if (rect.isPointInside(shoot)) {
                updatePacket.shots.push(shoot);
            }
        }

        updatePacket.map.width = this.game.width;
        updatePacket.map.height = this.game.height;
        updatePacket.mapDirty = this.firstPacket ?? this.game.mapDirty;

        this.firstPacket = false;

        this.packetStream.stream.index = 0;
        this.packetStream.serializeServerPacket(updatePacket);

        for (const packet of this.packetsToSend) {
            this.packetStream.serializeServerPacket(packet);
        }

        this.packetsToSend.length = 0;
        const buffer = this.packetStream.getBuffer();
        this.sendData(buffer);
    }

    packetStream = new PacketStream(GameBitStream.create(1 << 16));

    readonly packetsToSend: Packet[] = [];

    sendPacket(packet: Packet): void {
        this.packetsToSend.push(packet);
    }

    sendData(data: ArrayBuffer): void {
        try {
            this.socket.send(data);
        } catch (error) {
            console.error("Error sending data:", error);
        }
    }

    processMessage(message: ArrayBuffer): void {
        const packetStream = new PacketStream(message);

        const packet = packetStream.deserializeClientPacket();

        if (packet === undefined) return;

        switch (true) {
            case packet instanceof JoinPacket: {
                this.join(packet);
                break;
            }
            case packet instanceof InputPacket: {
                this.processInput(packet);
                break;
            }
        }
    }

    join(packet: JoinPacket): void {
        this.name = packet.name.trim();
        if (!this.name) this.name = GameConstants.player.defaultName;

        this.game.players.add(this);
        this.game.grid.addEntity(this);

        console.log(`"${this.name}" joined the game`);
    }

    processInput(packet: InputPacket): void {
        // if the direction changed set to dirty
        if (!Vec2.equals(this.direction, packet.direction)) {
            this.setDirty();
        }
        this.direction = packet.direction;
        this.mouseDown = packet.mouseDown;
        this.shoot = packet.shoot;
    }

    get data(): Required<EntitiesNetData[EntityType.Player]> {
        return {
            position: this.position,
            direction: this.direction,
            full: {
                health: this.health
            }
        };
    }
}
