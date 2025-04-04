import { PetalDefinition, getDisplayedPieces } from "../../../common/src/definitions/petal";
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

    readonly totalPieces: number;
    readonly totalDisplayedPieces: number;
    readonly definition: PetalDefinition;
    petals: ServerPetal[] = [];

    rotationRadians = 0;

    constructor(inventory: Inventory, definition: PetalDefinition) {
        this.inventory = inventory;
        const player = inventory.player;
        this.player = player;
        this.definition = definition;
        this.position = player.position;

        this.totalPieces = definition.pieceAmount;
        this.totalDisplayedPieces = getDisplayedPieces(definition);

        for (let i = 0; i < this.totalPieces; i++) {
            this.petals.push(new ServerPetal(player, definition));
        }
    }

    tick(radius: number, revolutionRadians: number, singleOccupiedRadians: number): void {
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
                    petal.position = Vec2.add(
                        firstPetalCenter,
                        MathGraphics.getPositionOnCircle(rotationRadians, GameConstants.petal.rotationRadius)
                    );

                    rotationRadians += singleRotatedRadians;
                });
            } else {
                let rotationRadians = revolutionRadians;

                this.petals.forEach(petal => {
                    petal.position = Vec2.add(
                        this.position,
                        MathGraphics.getPositionOnCircle(rotationRadians, radius)
                    )

                    rotationRadians += singleOccupiedRadians;
                });
            }
        } else {
            this.petals[0].position = firstPetalCenter;
        }
    }
}
