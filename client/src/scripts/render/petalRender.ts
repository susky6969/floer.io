import { Game } from "@/scripts/game";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector";
import { P2, MathGraphics } from "@common/utils/math";
import { GameConstants } from "@common/constants.ts";

const light_pieces = [0, 1, 2, 3, 4];

export function updateEquipPetalColumn(game: Game) {
    const column = game.ui.equipPetalColumn;
    // column.children().remove();
    let index = 0;
    [0, 1, 2, 3, 4].forEach(() => {
        const petal_slot = $(
            `<div class="equipped-petal-slot"></div>`
        );
        const petal_box = $(
            `<div class="petal rarity-common" petalName="Light"></div>`
        );

        const center = Vec2.new(19, 14);
        const radius = 8;

        const height = 50;
        const width = 50;

        const count = light_pieces.length;

        let rad = 0;
        petal_slot.append(petal_box);

        column.append(petal_slot);

        light_pieces.forEach(() => {
            const petal = $("<img alt='' class='piece-petal' src='../../../public/img/game/petal/light.svg'>");
            petal.css("width", "25%");
            petal.css("height", "25%");
            const { x, y } = Vec2.add(center, MathGraphics.getPositionOnCircle(rad, radius));

            petal.css("top", `${y / height * 100}%`);
            petal.css("left", `${x / width * 100}%`);

            rad += P2 / count;

            petal_box.append(petal);
        });
        index += 1;
    });
}
