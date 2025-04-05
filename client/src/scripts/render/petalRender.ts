import { Game } from "@/scripts/game";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector";
import { P2, MathGraphics } from "@common/utils/math";
import { PetalDefinition, Petals } from "@common/definitions/petal.ts";

const defaultCenter = Vec2.new(25, 21);

const defaultRadius = 8;
const defaultBoxSize = 50;

export function renderPetalPiece(
    xOffset: number, yOffset: number, displaySize: number, petal: PetalDefinition, petal_box: JQuery
){
    const sizePercent = displaySize;
    const size = sizePercent / 100 * defaultBoxSize / 2;
    const center = Vec2.sub(defaultCenter, Vec2.new(size, size));

    const piece = $(`<img alt='' class='piece-petal' src='/img/game/petal/${petal.idString}.svg'>`);
    piece.css("width", `${ sizePercent }%`);
    piece.css("height", `${ sizePercent }%`);
    const { x, y } = center;

    piece.css("top", `${ (y + yOffset) / defaultBoxSize * 100 }%`);
    piece.css("left", `${ (x + xOffset) / defaultBoxSize * 100 }%`);

    petal_box.append(piece);
}

export function renderPetal(petal: PetalDefinition) {
    const petal_box = $<HTMLDivElement>(
        `<div class="petal rarity-common" petalName="${petal.displayName}"></div>`
    );

    if (petal.isDuplicate) {
        let radiansNow = 0;
        const count = petal.pieceAmount;

        for (let i = 0; i < count; i++) {
            const { x, y } = MathGraphics.getPositionOnCircle(radiansNow, defaultRadius)
            renderPetalPiece(x, y,25, petal, petal_box);

            radiansNow += P2 / count;
        }
    } else {
        renderPetalPiece(0, 0, petal.displaySize, petal, petal_box);
    }

    return petal_box;
}

export function updatePetalRows(game: Game) {
    const equipRow = game.ui.equipPetalRow;
    equipRow.children().remove();
    const equpping_petals = ["light", "stinger", "sand", "sand", "rose"].map(
        (e) => Petals.fromString(e)
    );
    equpping_petals.forEach((petal) => {
        const petal_slot = $(
            `<div class="equipped-petal-slot"></div>`
        );

        petal_slot.append(renderPetal(petal));

        equipRow.append(petal_slot);
    })

    const prepareRow = game.ui.preparePetalRow;
    prepareRow.children().remove();
    const preparation_petals = ["light", "stinger", "sand", "sand", "rose"].map(
        (e) => Petals.fromString(e)
    );
    preparation_petals.forEach((petal) => {
        const petal_slot = $(
            `<div class="equipped-petal-slot"></div>`
        );

        prepareRow.append(petal_slot);
    })
}
