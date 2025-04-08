import { ServerPlayer } from "../entities/serverPlayer";
import { PetalBunch } from "./petalBunch";
import { Game } from "../game";
import {
    PetalDefinition,
    Petals,
    SavedPetalDefinitionData
} from "../../../common/src/definitions/petal";
import { P2 } from "../../../common/src/utils/math";
import { Vector } from "../../../common/src/utils/vector";
import { GameConstants } from "../../../common/src/constants";
import { PetalAttributeEventManager } from "../utils/eventManager";

export class Inventory {
    position: Vector;

    readonly game: Game;
    readonly player: ServerPlayer;

    petalBunches: PetalBunch[] = [];

    equipped_petals: SavedPetalDefinitionData[] = [];
    inventory: SavedPetalDefinitionData[] = [];

    private totalDisplayedPetals = 0;

    private revolutionRadians = 0;
    range = 0;

    eventManager = new PetalAttributeEventManager();

    constructor(player: ServerPlayer) {
        this.game = player.game;
        this.player = player;
        this.position = player.position;

        for (let i = 0; i < GameConstants.player.defaultSlot; i++) {
            this.equipped_petals.push(
                Petals.fromStringData(GameConstants.player.defaultEquippedPetals[i])
            );
            this.petalBunches.push(new PetalBunch(this, this.equipped_petals[i]));
            this.inventory.push(
                Petals.fromStringData(GameConstants.player.defaultEquippedPetals[i])
            );
        }

        for (let i = 0; i < GameConstants.player.defaultSlot; i++) {
            this.inventory.push(
                Petals.fromStringData(GameConstants.player.defaultPreparationPetals[i])
            );
        }
    }

    switchPetal(index1: number, index2: number) {
        if (index1 < 0 || index1 > this.inventory.length) return
        if (index2 < 0 || index2 > this.inventory.length) return
        if (this.inventory[index1] === this.inventory[index2]) return

        const trans = this.inventory[index1];

        this.updateInventory(index1, this.inventory[index2]);
        this.updateInventory(index2, trans);
    }

    delete(petalIndex: number) {
        if (petalIndex < 0 || petalIndex > this.inventory.length) return
        this.updateInventory(petalIndex, null);
    }

    updateInventory(index: number, petal: SavedPetalDefinitionData){
        this.inventory[index] = petal;
        this.updateEquipment(index, petal);

        this.player.dirty.inventory = true;
    }

    updateEquipment(index: number, petal?: SavedPetalDefinitionData) {
        if (index >= this.petalBunches.length) return;
        if (petal === undefined) {
            petal = this.inventory[index];
        }
        this.petalBunches[index].destroy();
        this.petalBunches[index] = new PetalBunch(this, petal);
        this.equipped_petals[index] = petal;
    }

    pickUp(petal: PetalDefinition): boolean {
        if (this.player.destroyed) return false;

        const emptySlot =
            this.inventory.find(e => e === null)

        if (emptySlot === null) {
            const index = this.inventory.indexOf(emptySlot);
            this.updateInventory(index, petal);

            return true
        }

        return false;
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
