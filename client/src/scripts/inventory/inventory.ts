import { Player } from "@/scripts/objects/player.ts";
import { PetalBunch } from "./petalBunch.ts";
import { Game } from "@/scripts/game.ts";
import { PetalCopyType, PetalMultipleType, Petals } from "@common/definitions/petal.ts";
import * as math from "@/scripts/utils/math.ts";

export class Inventory {
    readonly game: Game;
    readonly player: Player;

    petalBunches: PetalBunch[];

    private displayPetalsCount = 0;

    private radian = 0;
    radius = 80;

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
        this.displayPetalsCount = 0;

        this.petalBunches.forEach((petalBunch) => {
            this.displayPetalsCount += petalBunch.displayPetalsCount;
        });
        const everyRadian = math.P2 / this.displayPetalsCount;

        this.radian += 0.02;

        let radianNow = this.radian;
        this.petalBunches.forEach((petalBunch) => {
            petalBunch.update(this, radianNow, everyRadian);
            radianNow += everyRadian * petalBunch.displayPetalsCount;
        });
    }
}
