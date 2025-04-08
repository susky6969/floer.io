import { PetalDefinition, getDisplayedPieces, SavedPetalDefinitionData } from "../../../common/src/definitions/petal";
import { ServerPetal } from "../entities/serverPetal";
import { P2, MathGraphics } from "../../../common/src/utils/math";
import { Vec2, Vector } from "../../../common/src/utils/vector";
import { Inventory } from "./inventory";
import { GameConstants } from "../../../common/src/constants";
import { ServerPlayer } from "../entities/serverPlayer";

export class PetalBunch {
    position: Vector;
    player: ServerPlayer;

    inventory: Inventory;

    readonly totalPieces: number = 0;
    readonly totalDisplayedPieces: number = 0;
    readonly definition: SavedPetalDefinitionData;
    petals: ServerPetal[] = [];

    rotationRadians = 0;

    constructor(inventory: Inventory, definition: SavedPetalDefinitionData) {
        this.inventory = inventory;

        const player = inventory.player;
        this.player = player;

        this.definition = definition;
        this.position = player.position;

        if (definition) {
            this.totalPieces = definition.pieceAmount;
            this.totalDisplayedPieces = getDisplayedPieces(definition);

            for (let i = 0; i < this.totalPieces; i++) {
                const petal = new ServerPetal(player, definition);
                this.petals.push(petal);
                petal.join()

                inventory.eventManager.loadPetal(petal);
            }
        }
    }

    tick(radius: number, revolutionRadians: number, singleOccupiedRadians: number): void {
        if (!this.definition) return;

        if (!this.definition.extendable
            && radius >= GameConstants.player.defaultPetalDistance
        ) radius = GameConstants.player.defaultPetalDistance;

        this.position = this.inventory.position;

        this.rotationRadians += 0.01;

        const firstPetalCenter = Vec2.add(
            this.position,
            MathGraphics.getPositionOnCircle(revolutionRadians, radius)
        );

        if (this.definition.isDuplicate) {
            const totalPieces = this.totalPieces;

            if (this.definition.isShowedInOne) {
                let rotationRadians = this.rotationRadians;
                const singleRotatedRadians = P2 / totalPieces;

                this.petals.forEach(petal => {
                    petal.setPositionSafe(
                        MathGraphics.getPositionOnCircle(rotationRadians, GameConstants.petal.rotationRadius, firstPetalCenter)
                    )

                    rotationRadians += singleRotatedRadians;
                });
            } else {
                let radiansNow = revolutionRadians;

                this.petals.forEach(petal => {
                    petal.setPositionSafe(
                        MathGraphics.getPositionOnCircle(radiansNow, radius, this.position)
                    )

                    radiansNow += singleOccupiedRadians;
                });
            }
        } else {
            this.petals[0].setPositionSafe(firstPetalCenter)
        }
    }

    destroy(): void {
        this.petals.forEach(petal => {
            petal.destroy();
            this.inventory.eventManager.removePetal(petal);
        })
    }
}
