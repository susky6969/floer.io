import { Game } from "@/scripts/game.ts";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector.ts";
import { P2, MathGraphics, MathNumeric } from "@common/utils/math.ts";
import { PetalDefinition, Petals, SavedPetalDefinitionData } from "@common/definitions/petal.ts";
import { UI } from "@/ui.ts";
import { RarityDefinitions } from "@common/definitions/rarity.ts";
import { getGameAssetsFile } from "@/scripts/utils/pixi.ts";

const defaultCenter = Vec2.new(25, 21);

interface DraggingData{
    item: JQuery | null,
    container: PetalContainer | null
}

let draggingData: DraggingData = {
    item: null, container: null
};

const defaultRadius = 8;
const defaultBoxSize = 50;

let selectingPetal: PetalContainer | undefined = undefined;

let deletingPetal: boolean = false;

export function renderPetalPiece(
    xOffset: number, yOffset: number, displaySize: number, petal: PetalDefinition
) {
    const sizePercent = displaySize;
    const size = sizePercent / 100 * defaultBoxSize / 2;
    const center = Vec2.sub(defaultCenter, Vec2.new(size, size));
    const rotatedDegree = MathGraphics.radiansToDegrees(petal.images?.slotRotation ?? 0);

    const piece = $(`<img alt='' class='piece-petal' src=
        '/img/game/petal/${getGameAssetsFile(petal)}'>`
    );
    piece.css("width", `${ sizePercent }%`);
    piece.css("height", `${ sizePercent }%`);
    const { x, y } = center;

    piece.css("top", `${ (y + yOffset) / defaultBoxSize * 100 }%`);
    piece.css("left", `${ (x + xOffset) / defaultBoxSize * 100 }%`);
    piece.css("transform", `rotate(${rotatedDegree}deg)`)

    return piece;
}

export function renderPetal(petal: PetalDefinition) {
    const petal_box = $<HTMLDivElement>(
        `<div class="petal" petalName="${petal.displayName}"></div>`
    );

    const rarity = RarityDefinitions.fromString(petal.rarity);
    const displaySize = petal.images?.slotDisplaySize ?? 25;

    petal_box.css("background", rarity.color);
    petal_box.css("border-color", rarity.border);

    if (petal.isDuplicate) {
        let radiansNow = 0;
        const count = petal.pieceAmount;

        for (let i = 0; i < count; i++) {
            const { x, y } = MathGraphics.getPositionOnCircle(radiansNow, defaultRadius)
            petal_box.append(
                renderPetalPiece(x, y, displaySize, petal)
            );

            radiansNow += P2 / count;
        }
    } else {
        petal_box.append(
            renderPetalPiece(0, 0, displaySize, petal)
        );
    }

    return petal_box;
}

export function renderPetalRow(petals: PetalContainer[], row: JQuery) {
    row.children().remove();
    petals.forEach((petalContainer) => {
        const petal_slot = $(`<div class="petal-slot"></div>`);

        petalContainer.ui_slot = petal_slot;

        petal_slot.on("mouseover",() => {
            selectingPetal = petalContainer;
        })

        petal_slot.on("mouseout",() => {
            selectingPetal = undefined;
        })

        row.append(petal_slot);

        if (petalContainer.petalDefinition) {
            if (draggingData.item && draggingData.container == petalContainer) return;
            const petal =
                renderPetal(petalContainer.petalDefinition);

            petal_slot.append(petal);

            petal.on("mousedown", (ev) => {
                if (draggingData.item) return;

                const dragging = $(`<div class="dragging-petal"></div>`);
                const {clientX, clientY} = ev;
                draggingData = {
                    item: dragging,
                    container: petalContainer
                }
                dragging.css(
                    "transform",
                    `translateX(${clientX}px) translateY(${clientY}px)`
                );

                dragging.append(petal);
                $("body").append(dragging);
            })
        }
    })
}

export class Inventory{
    equippedPetals: PetalContainer[] = [];
    preparationPetals: PetalContainer[] = [];

    readonly ui: UI;

    get inventory(): PetalContainer[] {
        return this.equippedPetals.concat(this.preparationPetals);
    }

    deletedPetalIndex: number = -1;
    switchedPetalIndex: number = -1;
    switchedToPetalIndex: number = -1;

    constructor(private readonly game: Game) {
        this.ui = game.ui;

        $(document).on("mousemove", (ev) => {
            if (draggingData.item) {
                const { clientX, clientY } = ev;
                draggingData.item.css("transform",`translateX(${clientX}px) translateY(${clientY}px)`);
            }
        })

        $(document).on("mouseup", (ev) => {
            if (draggingData.item && draggingData.container) {
                draggingData.item.remove();
                draggingData.item = null;

                if (selectingPetal) {
                    const trans = selectingPetal.petalDefinition;
                    selectingPetal.petalDefinition = draggingData.container.petalDefinition;
                    draggingData.container.petalDefinition = trans;
                    this.switchedPetalIndex = this.inventory.indexOf(draggingData.container);
                    this.switchedToPetalIndex = this.inventory.indexOf(selectingPetal);
                }

                if (deletingPetal) {
                    draggingData.container.petalDefinition = null;
                    this.deletedPetalIndex = this.inventory.indexOf(draggingData.container);
                }

                this.updatePetalRows()
            }
        })
    }

    init(slot: number){
        this.equippedPetals = [];
        this.preparationPetals = [];
        for (let i = 0; i < slot; i++) {
            this.equippedPetals.push(new PetalContainer())
            this.preparationPetals.push(new PetalContainer())
        }
    }

    static loadLoadout(petals: PetalContainer[], loadout: string[] | number[]){
        let index = 0;
        for (const equip of loadout) {
            if (index > petals.length) break;
            if (typeof equip === 'number'){
                petals[index].loadFromId(equip);
            } else {
                petals[index].loadFromString(equip);
            }
            index ++;
        }
    }

    load(equips: string[] | number[], prepares: string[] | number[]) {
        Inventory.loadLoadout(this.equippedPetals, equips);
        Inventory.loadLoadout(this.preparationPetals, prepares);
    }

    loadInventory(inventory: SavedPetalDefinitionData[]) {
        let index = 0;
        for (const equip of inventory) {
            if (index >= this.equippedPetals.length) {
                const pindex = index - this.equippedPetals.length;

                if (pindex >= this.preparationPetals.length) break;

                if (equip) {
                    this.preparationPetals[pindex].petalDefinition = equip;
                } else {
                    this.preparationPetals[pindex].petalDefinition = null;
                }

                index ++;

                continue;
            }
            if (equip) {
                this.equippedPetals[index].petalDefinition = equip;
            } else {
                this.equippedPetals[index].petalDefinition = null;
            }
            index ++;
        }

        this.updatePetalRows();
    }

    updatePetalRows() {
        selectingPetal = undefined;

        renderPetalRow(this.equippedPetals, this.ui.equippedPetalRow);
        renderPetalRow(this.preparationPetals, this.ui.preparationPetalRow);

        if (this.game.running) {
            this.ui.hud.append(this.ui.petalColumn);
            this.ui.preparationPetalRow.append(this.ui.deletePetal);

            this.ui.deletePetal.on("mouseover",() => {
                deletingPetal = true;
            });

            this.ui.deletePetal.on("mouseout",() => {
                deletingPetal = false;
            });

        } else {
            this.ui.main.append(this.ui.petalColumn);
            this.ui.deletePetal.remove();
        }
    }

    equippedPetalsData(): SavedPetalDefinitionData[] {
        return this.equippedPetals.reduce(
            (pre, cur) => {
                if (cur.petalDefinition){
                    pre.push(cur.petalDefinition)
                } else {
                    pre.push(null);
                }
                return pre;
            },
            [] as SavedPetalDefinitionData[]
        )
    }

    switchSlot(slot: number) {
        if (slot - 1 >= this.equippedPetals.length) return;
        this.switchedPetalIndex = slot - 1;
        this.switchedToPetalIndex = slot + this.equippedPetals.length - 1;
    }
}

export class PetalContainer {
    ui_slot?: JQuery;
    petalDefinition: SavedPetalDefinitionData = null;

    constructor() {}

    loadFromString(idString: string): this{
        this.petalDefinition = Petals.fromStringData(idString);
        return this;
    }

    loadFromId(id: number): this{
        this.petalDefinition = Petals.definitions[id];
        return this;
    }
}
