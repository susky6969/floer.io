import { Application, Graphics } from "pixi.js";
import { UI } from "@/ui.ts";
import { EntityPool } from "@common/utils/entityPool";
import { ClientPlayer } from "@/scripts/entities/clientPlayer.ts";
import { loadAssets } from "@/scripts/utils/pixi";
import { Camera } from "@/scripts/render/camera";
import { ClientEntity } from "@/scripts/entities/clientEntity.ts";
import { EntityType, GameConstants } from "@common/constants.ts";
import { Inventory, PetalContainer } from "@/scripts/inventory.ts";
import { ClientApplication } from "../main.ts";
import { JoinPacket } from "@common/packets/joinPacket.ts";
import { GameBitStream, Packet, PacketStream } from "@common/net.ts";
import { UpdatePacket } from "@common/packets/updatePacket.ts";
import { ClientPetal } from "@/scripts/entities/clientPetal.ts";
import { Input } from "@/scripts/input.ts";
import { InputPacket } from "@common/packets/inputPacket.ts";
import { Minimap } from "@/scripts/render/minimap.ts";
import { ClientMob } from "@/scripts/entities/clientMob.ts";
import { GameOverPacket } from "@common/packets/gameOverPacket.ts";
import { Tween } from '@tweenjs/tween.js';
import { ClientLoot } from "@/scripts/entities/clientLoot.ts";

const typeToEntity = {
    [EntityType.Player]: ClientPlayer,
    [EntityType.Petal]: ClientPetal,
    [EntityType.Mob]: ClientMob,
    [EntityType.Loot]: ClientLoot
}


export class Game {
    socket?: WebSocket | undefined;

    readonly app: ClientApplication;
    readonly ui: UI;
    readonly pixi = new Application();

    running = false;

    // This means which player are controlled by the user
    activePlayerID = -1;
    width: number = 0;
    height: number = 0;

    get activePlayer(): ClientPlayer | undefined {
        if (this.activePlayerID) return this.entityPool.get(this.activePlayerID) as ClientPlayer;
        return undefined;
    }

    readonly entityPool = new EntityPool<ClientEntity>();

    readonly camera = new Camera(this);

    readonly input = new Input(this);

    readonly miniMap = new Minimap(this);

    constructor(app: ClientApplication) {
        this.app = app;
        this.ui = app.ui;
        this.inventory = new Inventory(this);
    }

    mapGraphics = new Graphics({
        zIndex: -99
    })

    inventory: Inventory;

    async init() {
        await this.pixi.init({
            resizeTo: window,
            resolution: 2,
            antialias: true,
            autoDensity: true,
            preference: "webgl",
            backgroundColor: "#29ca77",
            canvas: document.getElementById("canvas") as HTMLCanvasElement
        });

        this.pixi.stop();
        this.pixi.ticker.add(() => this.render());
        this.pixi.renderer.on("resize", () => this.resize());

        this.miniMap.init();

        this.camera.init();

        this.inventory.init(GameConstants.player.defaultSlot);
        this.inventory.load(
            GameConstants.player.defaultEquippedPetals,
            GameConstants.player.defaultPreparationPetals,
        )

        await loadAssets();
        this.inventory.updatePetalRows();
    }

    startGame() {
        if (this.running) return;
        this.running = true;

        this.ui.inGameScreen.css("display", "block");
        this.ui.outGameScreen.css("display", "none");
        this.ui.hud.append(this.ui.petalColumn);

        this.pixi.start();
    }

    endGame() {
        this.running = false;

        this.pixi.stop();

        for (const entity of this.entityPool) {
            entity.destroy();
        }

        this.camera.clear();
        this.entityPool.clear();
        this.activePlayerID = -1;

        this.ui.inGameScreen.css("display", "none");
        this.ui.outGameScreen.css("display", "block");

        this.ui.main.append(this.ui.petalColumn);

        this.ui.gameOverScreen.css("display", "none");
    }

    onMessage(data: ArrayBuffer): void {
        const packetStream = new PacketStream(data);
        while (true) {
            const packet = packetStream.deserializeServerPacket();
            if (packet === undefined) break;

            switch (true) {
                case packet instanceof UpdatePacket: {
                    this.updateFromPacket(packet);
                    this.startGame();
                    break;
                }
                case packet instanceof GameOverPacket: {
                    this.ui.showGameOverScreen(packet);
                    break;
                }
            }
        }
    }

    updateFromPacket(packet: UpdatePacket): void {
        if (packet.playerDataDirty.id) {
            this.activePlayerID = packet.playerData.id;
        }

        if (packet.playerDataDirty.zoom) {
            this.camera.zoom = packet.playerData.zoom;
        }

        for (const id of packet.deletedEntities) {
            this.entityPool.get(id)?.destroy();
            this.entityPool.deleteByID(id);
        }

        for (const entityData of packet.fullEntities) {
            let entity = this.entityPool.get(entityData.id);
            let isNew = false;

            if (!entity) {
                isNew = true;
                entity = new typeToEntity[entityData.type](this, entityData.id);
                this.entityPool.add(entity);
            }
            entity.updateFromData(entityData.data, isNew);
        }

        for (const entityPartialData of packet.partialEntities) {
            const entity = this.entityPool.get(entityPartialData.id);

            if (!entity) {
                console.warn(`Unknown partial dirty entity with ID ${entityPartialData.id}`);
                continue;
            }
            entity.updateFromData(entityPartialData.data, false);
        }

        if (packet.mapDirty) {
            this.width = packet.map.width;
            this.height = packet.map.height;

            this.miniMap.resize();

            const ctx = this.mapGraphics;
            ctx.clear();
            this.camera.addObject(ctx);

            const gridSize = 1.4 * Camera.scale;
            const gridWidth = packet.map.width * Camera.scale;
            const gridHeight = packet.map.height * Camera.scale;
            for (let x = 0; x <= gridWidth; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, gridHeight);
            }

            for (let y = 0; y <= gridHeight; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(gridWidth, y);
            }

            ctx.stroke({
                color: 0x000000,
                alpha: 0.05,
                width: 2
            });
        }
    }

    sendPacket(packet: Packet) {
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            const packetStream = new PacketStream(GameBitStream.create(128));
            packetStream.serializeClientPacket(packet);
            this.socket.send(packetStream.getBuffer());
        }
    }

    connect(address: string) {
        this.ui.readyButton.prop("disabled", true);

        this.socket = new WebSocket(address);

        this.socket.binaryType = "arraybuffer";

        this.socket.onmessage = msg => {
            this.onMessage(msg.data);
        };

        this.socket.onopen = () => {
            const joinPacket = new JoinPacket();
            const name = this.ui.nameInput.val();
            joinPacket.name = name ? name : GameConstants.player.defaultName;
            this.sendPacket(joinPacket);
        };

        this.socket.onclose = () => {
            this.endGame();
        };

        this.socket.onerror = error => {
            console.error(error);
            this.endGame();
        };
    }

    render() {
        if (!this.running) return;

        for (const entity of this.entityPool) {
            entity.render();
        }

        if (this.activePlayer) {
            this.camera.position = this.activePlayer.container.position;
        }

        this.camera.render();

        this.miniMap.render();

        const inputPacket = new InputPacket();
        inputPacket.isAttacking = this.input.isInputDown("Mouse0");
        inputPacket.isDefending = this.input.isInputDown("Mouse2");
        inputPacket.direction = this.input.mouseDirection;
        inputPacket.mouseDistance = this.input.mouseDistance;
        inputPacket.equipped_petals = this.inventory.equipped_petals();

        this.sendPacket(inputPacket);
    }

    resize() {
        this.camera.resize();
        this.miniMap.resize();
    }
}
