import { Game } from "@/scripts/game.ts";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector.ts";
import { P2, MathGraphics, MathNumeric } from "@common/utils/math.ts";
import { AttributeParameters, PetalDefinition, Petals, SavedPetalDefinitionData } from "@common/definitions/petal.ts";
import { UI } from "@/ui.ts";
import { RarityName, Rarity } from "@common/definitions/rarity.ts";
import { getGameAssetsFile } from "@/scripts/utils/pixi.ts";
import { PlayerModifiers } from "@common/typings.ts";
import { AttributeName } from "@common/definitions/attribute.ts";

const defaultCenter = Vec2.new(25, 21);

interface DraggingData{
    item: JQuery | null,
    container: PetalContainer | null
}

interface showingParameters{
    startsWith?: string
    value?: string
    endsWith?: string
    fontSize?: number
    color?: string
}

interface showingConfig {
    displayName: string
    color: string
    startsWith?: string
    endsWith?: string
    noValue?: boolean
}

type AttributeShowingFunction<K extends AttributeName> = (data: Required<AttributeParameters>[K]) => (showingConfig & { value: string })[];

let draggingData: DraggingData = {
    item: null, container: null
};

const defaultRadius = 8;
const defaultBoxSize = 50;

let selectingPetal: PetalContainer | undefined = undefined;

let deletingPetal: boolean = false;

const showingConfig: { [key: string] : showingConfig } =
    {
        damage: {
            displayName: "Damage",
            color: "#fd6565"
        },
        health: {
            displayName: "Health",
            color: "#58fd48"
        },
        healing: {
            displayName: "Healing",
            color: "#58fd48",
            startsWith: "+",
            endsWith: "%"
        },
        maxHealth: {
            displayName: "Flower Max Health",
            color: "#58fd48",
            startsWith: "+"
        },
        healPerSecond: {
            displayName: "Heal",
            color: "#58fd48",
            endsWith: "/s"
        },
        undroppable: {
            displayName: "Undroppable",
            color: "#656548",
            noValue: true
        }
    }

const attributesShowingConfig: { [K in AttributeName] : AttributeShowingFunction<K>} =
    {
        absorbing_heal: (data) => {
            return [{
                displayName: "Heal",
                value: data.toString(),
                color: "#58fd48"
            }]
        },
        boost: () => [],
        body_poison: (data) => {
            return [{
                displayName: "Body Poison",
                value: `${data.damagePerSecond * data.duration} (${data.damagePerSecond}/s)`,
                color: "#ce76db"
            }]
        },
        damage_reflection: (data) => {
            return [{
                displayName: "Damage Reflection",
                value: `${data * 100}%`,
                color: "#989898"
            }]
        },
        healing_debuff: (data) => {
            return [{
                displayName: "Healing Debuff",
                value: `-${100 - data.healing * 100}% `,
                color: "#989898"
            }, {
                displayName: "Duration",
                value: `${data.duration}s`,
                color: "#6161f0"
            },]
        },
        poison: (data) => {
            return [{
                displayName: "Poison",
                value: `${data.damagePerSecond * data.duration} (${data.damagePerSecond}/s)`,
                color: "#ce76db"
            }]
        },
        shoot: () => []
    }

export function renderPetalPiece(
    xOffset: number, yOffset: number, displaySize: number, petal: PetalDefinition
) {
    const sizePercent = displaySize;
    const size = sizePercent / 100 * defaultBoxSize / 2;
    const center = Vec2.sub(defaultCenter, Vec2.new(size, size));
    const rotatedDegree =
        MathGraphics.radiansToDegrees(petal.images?.slotRotation ?? 0);

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

    const rarity = Rarity.fromString(petal.rarity);
    const displaySize = petal.images?.slotDisplaySize ?? 25;
    const offsetX = petal.images?.centerXOffset ?? 0;
    const offsetY = petal.images?.centerYOffset ?? 0;

    petal_box.css("background", rarity.color);
    petal_box.css("border-color", rarity.border);

    if (petal.isDuplicate) {
        let radiansNow = 0;
        const count = petal.pieceAmount;

        for (let i = 0; i < count; i++) {
            const { x, y } = MathGraphics.getPositionOnCircle(radiansNow, defaultRadius)
            petal_box.append(
                renderPetalPiece(x + offsetX, y + offsetY, displaySize, petal)
            );

            radiansNow += P2 / count;
        }
    } else {
        petal_box.append(
            renderPetalPiece(offsetX, offsetY, displaySize, petal)
        );
    }

    return petal_box;
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

        this.renderPetalRow(this.equippedPetals, this.ui.equippedPetalRow);
        this.renderPetalRow(this.preparationPetals, this.ui.preparationPetalRow);

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

    renderPetalRow(petals: PetalContainer[], row: JQuery) {
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

                petal.on("mouseover",(ev) => {
                    this.showInformation(petalContainer);
                })

                petal.on("mouseout",(ev) => {
                    this.ui.petalInformation.remove();
                })
            }
        })
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

    showInformation(container: PetalContainer) {
        const slot = container.ui_slot;
        if (!slot) return;
        const definition = container.petalDefinition;
        if (!definition) return;

        const box = this.ui.petalInformation;
        box.empty();

        const offset = slot.offset();
        if (offset){
            box.css("left", offset.left + "px");
            box.css("top", offset.top - 10 + "px");
        }

        function addLine(args: showingParameters){
            let {
                startsWith,
                endsWith,
                value,
                fontSize,
                color
            } = args;
            startsWith = startsWith ? startsWith + "&nbsp;" : "";
            endsWith = endsWith ?? "";
            value = value ?? "";
            fontSize = fontSize ?? 13;
            color = color ?? "#FFFFFF";

            const line = $(`<div></div>`);
            line.css("display", "flex");

            const startS =
                $(`<p textStroke="${startsWith}">${startsWith}</p>`);

            const valueS =
                $(`<p textStroke="${value}">${value}</p>`);

            const endS =
                $(`<p textStroke="${endsWith}">${endsWith}</p>`);

            startS.css("font-size", fontSize + "px")
            startS.css("color", color)

            valueS.css("font-size", fontSize + "px")
            valueS.css("color", "#FFFFFF");

            endS.css("font-size", fontSize + "px");
            endS.css("color", "#FFFFFF");

            line.append(startS);
            line.append(valueS);
            line.append(endS);

            box.append(line);
        }

        function addBr(){
            box.append($("<br>"));
        }

        function addAttribute(config: typeof showingConfig[string], value: string) {
            if (config.noValue) {
                addLine({
                    startsWith: config.displayName,
                    color: config.color
                })

                return;
            }
            addLine({
                startsWith: config.displayName
                    + `: `,
                value: `${config.startsWith ?? ""}` + value,
                endsWith: config.endsWith ?? "",
                color: config.color
            })
        }

        addLine({
            value: definition.displayName,
            fontSize: 25
        })

        const rarity = Rarity.fromStringSafe(definition.rarity);
        if (rarity) {
            addLine({
                startsWith: rarity.displayName,
                value: "",
                fontSize: 12,
                color: rarity.color
            })
        }

        addBr();

        for (const definitionKey in definition) {
            if (showingConfig.hasOwnProperty(definitionKey)) {
                const showing =
                    showingConfig[definitionKey];
                addAttribute(showing,
                    (definition[definitionKey as keyof PetalDefinition]
                        ?? "").toString()
                );
            }
        }

        if (definition.modifiers) {
            for (const modifiersDefinitionKey in definition.modifiers) {
                const showing =
                    showingConfig[modifiersDefinitionKey];
                addAttribute(showing,
                    (definition.modifiers
                            [modifiersDefinitionKey as keyof PlayerModifiers]
                        ?? "").toString()
                );
            }
        }

        if (definition.attributes) {
            let attributesDefinitionKey: AttributeName;
            for (attributesDefinitionKey in definition.attributes) {
                const data = definition.attributes[attributesDefinitionKey];
                if (!data) return attributesDefinitionKey;
                const config =
                    (attributesShowingConfig[attributesDefinitionKey] as AttributeShowingFunction<typeof attributesDefinitionKey>)
                    (data);
                config.forEach(e => {
                    addAttribute(e as showingConfig,
                        e.value
                    );
                })
            }
        }

        if (definition.reloadTime) {
            let content = definition.reloadTime + "s";
            if (definition.usable) {
                content += " + " + definition.useTime + "s";
            }
            const reload = $(`<p textStroke="${content}">${content}<p>`);

            reload.css("position", "absolute");
            reload.css("right", "7px");
            reload.css("top", "10px");

            box.append(reload);
        }

        const occupy = $("<div style='height: 1px; width: 200px'></div>");
        box.append(occupy)

        $("body").append(box);
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
