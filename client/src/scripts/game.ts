import { Application } from "pixi.js";
import { UIManager } from "@/scripts/uiManager";
import { setupUI } from "@/scripts/ui";
import { EntityPool } from "@common/utils/entityPool";
import { Player } from "@/scripts/entities/player";
import { loadTextures } from "@/scripts/utils/pixi";
import { Camera } from "@/scripts/render/camera";
import { EntityType } from "@common/constants";
import { updateEquipPetalColumn } from "@/scripts/render/petal";
import { Petal } from "@/scripts/entities/petal";

type EntityClassMapping = {
    readonly [EntityType.Player]: typeof Player
    readonly [EntityType.Petal]: typeof Petal
};

// For creating new entities.
// const EntityClassMapping: EntityClassMapping = Object.freeze<{
//     readonly [K in EntityType]: new (game: Game, id: number) => InstanceType<ObjectClassMapping[K]>
// }>({
//             [EntityType.Player]: Player,
//             [EntityType.Petal]: Petal
//         });

// For giving EntityPool the correct type
type EntityMapping = {
    readonly [Cat in keyof EntityClassMapping]: InstanceType<EntityClassMapping[Cat]>
};

export class Game {
    private activeId = 0;

    // Giving ID by using this.
    get nextObjectID(): number {
        return this.activeId++;
    }

    // This means which player are controlled by the user
    activePlayerID = -1;

    get activePlayer(): Player | undefined {
        if (this.activePlayerID) return this.entityPool.get(this.activePlayerID) as Player;
        return undefined;
    }

    readonly entityPool = new EntityPool<EntityMapping[EntityType]>();

    readonly pixi = new Application();
    readonly uiManager = new UIManager(this);

    readonly camera = new Camera(this);

    static instance: Game;

    startGame() {
        this.pixi.start();
        this.activePlayerID = 0;
    }

    render() {
        for (const entity of this.entityPool) {
            entity.update();
        }

        if (this.activePlayer) {
            this.camera.position = this.activePlayer.position;
        }

        this.camera.render();
    }

    static async init() {
        if (Game.instance) return;
        const game = new Game();
        Game.instance = game;
        await game.pixi.init({
            resizeTo: window,
            backgroundColor: "#29ca77",
            canvas: document.getElementById("canvas") as HTMLCanvasElement
        });

        const { pixi } = game;

        pixi.stop();

        pixi.ticker.add(() => {
            game.render();
        });

        pixi.renderer.on("resize", () => {
            game.camera.resize();
        });

        game.camera.resize();

        pixi.stage.addChild(game.camera.container);

        await setupUI(game);
        await loadTextures();
        updateEquipPetalColumn(game);

        console.info("Game Initialized.");
    }
}
