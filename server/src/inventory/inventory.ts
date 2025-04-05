import { ServerPlayer } from "../entities/serverPlayer";
import { PetalBunch } from "./petalBunch";
import { Game } from "../game";
import { PetalDefinition, Petals, SavedPetalDefinitionData } from "../../../common/src/definitions/petal";
import { P2 } from "../../../common/src/utils/math";
import { Vector } from "../../../common/src/utils/vector";
import { GameConstants } from "../../../common/src/constants";
import { differencesOfSameLengthArray } from "../../../common/src/utils/array";

export class Inventory {
    position: Vector;

    readonly game: Game;
    readonly player: ServerPlayer;

    petalBunches: PetalBunch[] = [];
    petals: SavedPetalDefinitionData[] = [];

    private totalDisplayedPetals = 0;

    private revolutionRadians = 0;
    range = 0;

    constructor(player: ServerPlayer) {
        this.game = player.game;
        this.player = player;
        this.position = player.position;

        for (let i = 0; i < GameConstants.player.defaultSlot; i++) {
            this.petals.push(null);
            this.petalBunches.push(new PetalBunch(this, null));
        }
    }

    loadFrom(petals: SavedPetalDefinitionData[]) {
        const differences =
            differencesOfSameLengthArray<SavedPetalDefinitionData>(
                this.petals, petals
            );

        differences.forEach((d) => {
            this.petalBunches[d.index].destroy();
            this.petalBunches[d.index] = new PetalBunch(this, d.to);
            this.petals[d.index] = d.to
        })
    }

    tick(): void {
        this.position = this.player.position;
        this.totalDisplayedPetals = 0;

        this.petalBunches.forEach(petalBunch => {
            this.totalDisplayedPetals += petalBunch.totalDisplayedPieces;
        });

        const radius = this.range;

        this.revolutionRadians += GameConstants.player.revolutionSpeed * this.game.dt;

        let revolutionRadians = this.revolutionRadians;
        const singleOccupiedRadians = P2 / this.totalDisplayedPetals;

        this.petalBunches.forEach(petalBunch => {
            petalBunch.tick(radius, revolutionRadians, singleOccupiedRadians);
            revolutionRadians += singleOccupiedRadians * petalBunch.totalDisplayedPieces;
        });
    }
}
