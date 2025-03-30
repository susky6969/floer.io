import { Player } from "@/entities/player";
import { PetalBunch } from "./petalBunch";
import { Game } from "@/game";
import { Petals } from "@common/definitions/petal";
import { P2 } from "@common/utils/math";

export class Inventory {
    readonly game: Game;
    readonly player: Player;

    petalBunches: PetalBunch[];

    private totalDisplayedPetals = 0;

    private revolutionRadians = 0;
    range = 80;

    constructor(game: Game, player: Player) {
        this.game = game;
        this.player = player;

        this.petalBunches = [];

        for (let i = 0; i < 2; i++) {
            this.petalBunches.push(new PetalBunch(game, Petals.fromString("light")));
        }
        for (let i = 0; i < 3; i++) {
            this.petalBunches.push(new PetalBunch(game, Petals.fromString("lighter")));
        }
    }

    update(): void {
        this.totalDisplayedPetals = 0;

        this.petalBunches.forEach(petalBunch => {
            this.totalDisplayedPetals += petalBunch.totalDisplayedPieces;
        });

        const singleOccupiedRadians = P2 / this.totalDisplayedPetals;
        const radius = this.range;

        this.revolutionRadians += 0.02;

        let revolutionRadians = this.revolutionRadians;
        this.petalBunches.forEach(petalBunch => {
            petalBunch.update(radius, revolutionRadians, singleOccupiedRadians);
            revolutionRadians += singleOccupiedRadians * petalBunch.totalDisplayedPieces;
        });
    }
}
