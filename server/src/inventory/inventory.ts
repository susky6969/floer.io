import { ServerPlayer } from "../entities/serverPlayer";
import { PetalBunch } from "./petalBunch";
import { Game } from "../game";
import { Petals } from "../../../common/src/definitions/petal";
import { P2 } from "../../../common/src/utils/math";

export class Inventory {
    readonly game: Game;
    readonly player: ServerPlayer;

    petalBunches: PetalBunch[];

    private totalDisplayedPetals = 0;

    private revolutionRadians = 0;
    range = 80;

    constructor(player: ServerPlayer) {
        this.game = player.game;
        this.player = player;

        this.petalBunches = [];

        for (let i = 0; i < 2; i++) {
            this.petalBunches.push(new PetalBunch(this.game, Petals.fromString("light")));
        }
        for (let i = 0; i < 3; i++) {
            this.petalBunches.push(new PetalBunch(this.game, Petals.fromString("lighter")));
        }
    }

    update(): void {
        this.totalDisplayedPetals = 0;

        this.petalBunches.forEach(petalBunch => {
            this.totalDisplayedPetals += petalBunch.totalDisplayedPieces;
        });

        const radius = this.range;

        this.revolutionRadians += 0.02;

        let revolutionRadians = this.revolutionRadians;
        const singleOccupiedRadians = P2 / this.totalDisplayedPetals;

        this.petalBunches.forEach(petalBunch => {
            petalBunch.update(radius, revolutionRadians, singleOccupiedRadians);
            revolutionRadians += singleOccupiedRadians * petalBunch.totalDisplayedPieces;
        });
    }
}
