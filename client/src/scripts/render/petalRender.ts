import { Game } from "@/scripts/game";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector";
import { P2, MathGraphics } from "@common/utils/math";
import { PetalDefinition, Petals } from "@common/definitions/petal.ts";

const light_pieces = [0, 1, 2, 3, 4];

export function renderPetal(petal: PetalDefinition) {
    const petal_box = $<HTMLDivElement>(
        `<div class="petal rarity-common" petalName="${petal.displayName}"></div>`
    );

    const defaultCenter = Vec2.new(25, 21);

    const defaultRadius = 8;
    const defaultBoxSize = 50;

    if (petal.isDuplicate) {


        let radiansNow = 0;
        const count = petal.pieceAmount;

        const sizePercent = 25;
        const size = sizePercent / 100 * defaultBoxSize / 2;
        const center = Vec2.sub(defaultCenter, Vec2.new(size, size));

        for (let i = 0; i < count; i++) {
            const piece = $(`<img alt='' class='piece-petal' src='/img/game/petal/${petal.idString}.svg'>`);
            piece.css("width", `${ sizePercent }%`);
            piece.css("height", `${ sizePercent }%`);
            const { x, y } =
                Vec2.add(center, MathGraphics.getPositionOnCircle(radiansNow, defaultRadius));

            piece.css("top", `${ y / defaultBoxSize * 100 }%`);
            piece.css("left", `${ x / defaultBoxSize * 100 }%`);

            radiansNow += P2 / count;

            petal_box.append(piece);
        }
    } else {

        const sizePercent = petal.displaySize;
        const size = sizePercent / 100 * defaultBoxSize / 2;
        const center = Vec2.sub(defaultCenter, Vec2.new(size, size));

        const piece = $(`<img alt='' class='piece-petal' src='/img/game/petal/${petal.idString}.svg'>`);
        piece.css("width", `${ sizePercent }%`);
        piece.css("height", `${ sizePercent }%`);
        const { x, y } = center;

        piece.css("top", `${ y / defaultBoxSize * 100 }%`);
        piece.css("left", `${ x / defaultBoxSize * 100 }%`);

        petal_box.append(piece);
    }

    return petal_box;
}

export function updateEquipPetalColumn(game: Game) {
    const equipColumn = game.ui.equipPetalRow;
    equipColumn.children().remove();
    const equpping_petals = ["light", "stinger", "sand", "sand", "rose"].map(
        (e) => Petals.fromString(e)
    );
    equpping_petals.forEach((petal) => {
        const petal_slot = $(
            `<div class="equipped-petal-slot"></div>`
        );

        petal_slot.append(renderPetal(petal));

        equipColumn.append(petal_slot);
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
