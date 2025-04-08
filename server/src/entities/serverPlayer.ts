import { type WebSocket } from "ws";
import { damageableEntity, ServerEntity } from "./serverEntity";
import { Vec2 } from "../../../common/src/utils/vector";
import { GameBitStream, type Packet, PacketStream } from "../../../common/src/net";
import { type Game } from "../game";
import { type EntitiesNetData, UpdatePacket } from "../../../common/src/packets/updatePacket";
import { CircleHitbox, RectHitbox } from "../../../common/src/utils/hitbox";
import { Random } from "../../../common/src/utils/random";
import { MathNumeric } from "../../../common/src/utils/math";
import { InputPacket } from "../../../common/src/packets/inputPacket";
import { JoinPacket } from "../../../common/src/packets/joinPacket";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { GameOverPacket } from "../../../common/src/packets/gameOverPacket";
import { Inventory } from "../inventory/inventory";
import { ServerPetal } from "./serverPetal";
import { ServerMob } from "./serverMob";
import { PetalDefinition, SavedPetalDefinitionData } from "../../../common/src/definitions/petal";
import { spawnLoot } from "../utils/loot";
import { PetalAttributeEvents } from "../utils/attribute";

export class ServerPlayer extends ServerEntity<EntityType.Player> {
    type: EntityType.Player = EntityType.Player;
    socket: WebSocket;

    hitbox = new CircleHitbox(GameConstants.player.radius);

    name = "";
    direction = Vec2.new(0, 0);
    mouseDistance: number = 0;
    isAttacking = false;
    isDefending = false;

    inventory: Inventory;

    damage: number = GameConstants.player.defaultBodyDamage;

    private _health = GameConstants.player.defaultHealth;

    get health(): number {
        return this._health;
    }

    set health(health: number) {
        if (health === this._health) return;
        this._health = MathNumeric.clamp(health, 0, GameConstants.player.maxHealth);
        this.setFullDirty();
    }

    kills = 0;

    firstPacket = true;

    /**
    * Entities the player can see
    */
    visibleEntities = new Set<ServerEntity>();

    // what needs to be sent again to the client
    readonly dirty = {
        id: true,
        zoom: true,
        inventory: false
    };

    private _zoom = 45;

    get zoom(): number {
        return this._zoom;
    }

    set zoom(zoom: number) {
        if (this._zoom === zoom) return;
        this._zoom = zoom;
        this.dirty.zoom = true;
    }

    get petalEntities(): ServerPetal[]{
        return this.inventory.petalBunches
            .reduce(
                (pre, petalBunch) =>
                    pre.concat(petalBunch.petals),
                [] as ServerPetal[]
            )
    }

    weight = 2;

    canReceiveDamageFrom(source: damageableEntity): boolean {
        switch (source.type) {
            case EntityType.Player:
                return source != this
            case EntityType.Mob:
                return true
            case EntityType.Petal:
                return source.owner != this
        }
    }

    constructor(game: Game, socket: WebSocket) {
        const position = Random.vector(
            0,
            GameConstants.player.spawnMaxX,
            0,
            GameConstants.player.spawnMaxY
        );
        super(game, position);
        this.position = position;
        this.socket = socket;
        this.inventory = new Inventory(this);
    }

    tick(): void {
        let position = Vec2.clone(this.position);

        const speed = Vec2.mul(
            this.direction,
            MathNumeric.remap(this.mouseDistance, 0, 150, 0, GameConstants.player.maxSpeed)
        );
        position = Vec2.add(position, Vec2.mul(speed, this.game.dt));

        this.position = position;

        this.inventory.range = GameConstants.player.defaultPetalDistance;

        if (this.isDefending) {
            this.sendEvent(PetalAttributeEvents.DEFEND);
            this.inventory.range = GameConstants.player.defaultPetalDefendingDistance;
        }

        if (this.isAttacking) {
            this.inventory.range = GameConstants.player.defaultPetalAttackingDistance;
        }

        this.inventory.tick();

        if (this.health < GameConstants.player.maxHealth)
            this.sendEvent(PetalAttributeEvents.HEALING)
    }

    dealDamageTo(to: damageableEntity): void{
        if (to.canReceiveDamageFrom(this))
            to.receiveDamage(this.damage, this);
    }

    receiveDamage(amount: number, source: ServerPlayer | ServerMob) {
        if (!this.isActive()) return;
        this.health -= amount;

        if (this.health <= 0) {
            this.destroy();

            if (source instanceof ServerPlayer) source.kills++;

            const gameOverPacket = new GameOverPacket();
            gameOverPacket.kills = this.kills;
            gameOverPacket.murderer = source.name;
            this.sendPacket(gameOverPacket);
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

        updatePacket.playerData.zoom = this.zoom;
        updatePacket.playerData.id = this.id;
        updatePacket.playerData.inventory = ([] as SavedPetalDefinitionData[])
            .concat(this.inventory.inventory);

        updatePacket.playerDataDirty = this.dirty;

        updatePacket.newPlayers = [...this.game.players];
        updatePacket.deletedPlayers = this.game.deletedPlayers;

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
        this.mouseDistance = packet.mouseDistance;
        this.isAttacking = packet.isAttacking;
        this.isDefending = packet.isDefending;
        this.inventory.switchPetal(packet.switchedPetalIndex, packet.switchedToPetalIndex);
        this.inventory.delete(packet.deletedPetalIndex);
    }

    sendEvent(event: PetalAttributeEvents){
        this.inventory.eventManager.sendEvent(event);
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

    destroy() {
        if (this.destroyed) return;
        super.destroy();
        for (const i of this.petalEntities){
            i.destroy();
        }
        spawnLoot(
            this.game,
            this.inventory.inventory
                .filter(e => e != null) as PetalDefinition[],
            this.position
        )
    }
}
