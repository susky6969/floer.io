import { PetalDefinition, getDisplayedPieces } from "../../../common/src/definitions/petal";
import { ServerPetal } from "../entities/serverPetal";
import { Game } from "../game";
import { P2, Graphics } from "../../../common/src/utils/math";
import { Vec2, Vector } from "../../../common/src/utils/vector";
import { Inventory } from "./inventory";
import { GameConstants } from "../../../common/src/constants";

export class PetalBunch {
    position!: Vector;
    readonly inventory: Inventory;

    readonly totalPieces: number;
    readonly totalDisplayedPieces: number;
    readonly definition: PetalDefinition;
    private petals: ServerPetal[] = [];

    rotationRadians = 0;

    constructor(game: Game, inventory: Inventory, definition: PetalDefinition) {
        this.definition = definition;
        this.inventory = inventory;

        this.totalPieces = definition.pieceAmount;
        this.totalDisplayedPieces = getDisplayedPieces(definition);

        for (let i = 0; i < this.totalPieces; i++) {
            this.petals.push(new ServerPetal(game, Vec2.new(0, 0)));
            game.grid.addEntity(this.petals[i]);

            this.petals[i].setFullDirty();
        }
    }

    tick(radius: number, revolutionRadians: number, singleOccupiedRadians: number): void {
        this.position = this.inventory.position;

        this.rotationRadians += 0.01;

        const petalCenter = Vec2.add(
            this.position,
            Graphics.getPositionOnCircle(revolutionRadians, radius)
        );

        if (this.definition.isDuplicate) {
            const totalPieces = this.totalPieces;

            if (this.definition.isShowedInOne) {
                let rotationRadians = this.rotationRadians;
                const singleRotatedRadians = P2 / totalPieces;

                this.petals.forEach(petal => {
                    petal.position = Vec2.add(
                        petalCenter,
                        Graphics.getPositionOnCircle(rotationRadians, GameConstants.petal.rotationRadius)
                    );

                    rotationRadians += singleRotatedRadians;
                });
            } else {
                let rotationRadians = revolutionRadians;

                this.petals.forEach(petal => {
                    petal.position = Vec2.add(
                        this.position,
                        Graphics.getPositionOnCircle(rotationRadians, radius)
                    )

                    rotationRadians += singleOccupiedRadians;
                });
            }
        } else {
            this.petals[0].position = petalCenter;
        }
    }
}
