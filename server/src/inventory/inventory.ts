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
import { AttributeEventManager } from "../utils/eventManager";
import { Rarity } from "../../../common/src/definitions/rarity";

export class Inventory {
    position: Vector;

    readonly game: Game;
    readonly player: ServerPlayer;

    petalBunches: PetalBunch[] = [];

    equipped_petals: SavedPetalDefinitionData[] = [];
    inventory: SavedPetalDefinitionData[] = [];

    slot: number = GameConstants.player.defaultSlot;
    prepareSlot: number = GameConstants.player.defaultPrepareSlot;

    private totalDisplayedPetals = 0;

    private revolutionRadians = 0;
    range = 0;

    eventManager = new AttributeEventManager();

    constructor(player: ServerPlayer) {
        this.game = player.game;
        this.player = player;
        this.position = player.position;
    }

    loadConfig(config: SavedPetalDefinitionData[]): void{
        this.equipped_petals = []
        this.petalBunches = []
        this.inventory = []

        for (let i = 0; i < this.slot; i++) {
            this.equipped_petals.push(config[i]);
            this.petalBunches.push(new PetalBunch(this, config[i]));
            this.inventory.push(config[i]);
        }

        for (let i = 0; i < this.prepareSlot; i++) {
            this.inventory.push(config[i + this.slot]);
        }
    }

    loadDefaultConfig(): void {
        this.equipped_petals = []
        this.petalBunches = []
        this.inventory = []

        for (let i = 0; i < this.slot; i++) {
            this.equipped_petals.push(
                Petals.fromStringData(GameConstants.player.defaultEquippedPetals[i])
            );
            this.petalBunches.push(new PetalBunch(this, this.equipped_petals[i]));
            this.inventory.push(
                Petals.fromStringData(GameConstants.player.defaultEquippedPetals[i])
            );
        }

        for (let i = 0; i < this.prepareSlot; i++) {
            this.inventory.push(
                Petals.fromStringData(GameConstants.player.defaultPreparationPetals[i])
            );
        }
    }

    changeSlotAmountTo(slot: number): void {
        if (this.slot > slot) {
            const offset = this.slot - slot;
            this.equipped_petals.splice(-offset, offset);
            this.petalBunches.splice(-offset, offset).forEach((petal) => {
                petal.destroy();
            });
            this.inventory.splice(this.slot - offset, offset);
        }else {
            const equipOffset = slot - this.slot;
            const prepare =
                this.inventory.splice(-this.prepareSlot, this.prepareSlot);
            for (let i = 0; i < equipOffset; i++) {
                this.equipped_petals.push(Petals.fromStringData(""));
                this.petalBunches.push(new PetalBunch(this, null));
                this.inventory.push(Petals.fromStringData(""));
            }

            this.inventory = this.inventory.concat(prepare);
        }

        this.slot = slot
        this.player.dirty.slot = true;
        this.player.dirty.inventory = true;
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
        if (petalIndex < 0 || petalIndex > this.inventory.length) return;
        const definition = this.inventory[petalIndex];
        if(definition) {
            this.player.addExp(Rarity.fromString(definition.rarity).expWhenAbsorb)
        }
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
        this.player.updateModifiers();
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

    drop(amount: number): PetalDefinition[] {
        const droppable =
            this.inventory.filter(e => e && !e.undroppable) as PetalDefinition[];
        const dropped = droppable.sort((a, b) => {
            return Rarity.fromString(b.rarity).level - Rarity.fromString(a.rarity).level
        }).splice(0, amount);

        dropped.forEach(e => {
            this.inventory[this.inventory.indexOf(e)] = null;
        })

        return dropped;
    }

    tick(): void {
        this.position = this.player.position;
        this.totalDisplayedPetals = 0;

        this.petalBunches.forEach(petalBunch => {
            this.totalDisplayedPetals += petalBunch.totalDisplayedPieces;
        });

        const radius = this.range;

        this.revolutionRadians += this.player.modifiers.revolutionSpeed * this.game.dt;

        let revolutionRadians = this.revolutionRadians;
        const singleOccupiedRadians = P2 / this.totalDisplayedPetals;

        this.petalBunches.forEach(petalBunch => {
            petalBunch.tick(radius, revolutionRadians, singleOccupiedRadians);
            revolutionRadians += singleOccupiedRadians * petalBunch.totalDisplayedPieces;
        });
    }
}
