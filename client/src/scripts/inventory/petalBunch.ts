import { PetalDefinition, getDisplayedPieces } from "@common/definitions/petal.ts";
import { Petal } from "@/scripts/entities/petal.ts";
import { Game } from "@/scripts/game.ts";
import { P2, Graphics } from "@common/utils/math.ts";
import { Vec2 } from "@common/utils/vector";

export class PetalBunch {
    readonly position = Vec2.new(0, 0);

    readonly totalPieces: number;
    readonly totalDisplayedPieces: number;
    readonly definition: PetalDefinition;
    private petals: Petal[] = [];

    rotationRadians = 0;

    constructor(game: Game, definition: PetalDefinition) {
        this.definition = definition;

        this.totalPieces = definition.pieceAmount;
        this.totalDisplayedPieces = getDisplayedPieces(definition);

        for (let i = 0; i < this.totalPieces; i++) {
            this.petals.push(new Petal(game, game.nextObjectID));
            game.objectPool.add(this.petals[i]);
        }
    }

    update(radius: number, revolutionRadians: number, singleOccupiedRadians: number): void {
        this.rotationRadians += 0.01;

        const center = Vec2.add(
            this.position,
            Graphics.getPositionOnCircleByRadians(revolutionRadians, radius)
        );

        if (this.definition.isDuplicate) {
            const totalPieces = this.totalPieces;

            if (this.definition.isShowedInOne) {
                let radiansNow = this.rotationRadians;
                const singleRotatedRandians = P2 / totalPieces;

                this.petals.forEach(petal => {
                    petal.position = Vec2.add(
                        center,
                        Graphics.getPositionOnCircleByRadians(radiansNow, 20)
                    );

                    radiansNow += singleRotatedRandians;
                });
            } else {
                let radiansNow = revolutionRadians;

                this.petals.forEach(petal => {
                    petal.position = Graphics.getPositionOnCircleByRadians(radiansNow, radius)

                    radiansNow += singleOccupiedRadians;
                });
            }
        } else {
            this.petals[0].position = center;
        }
    }
}
