import { Game } from "@/scripts/game";
import $ from "jquery";
import { Vec2 } from "@common/utils/vector";
import { P2, Graphics } from "@common/utils/math";

const light_pieces = [0, 1, 2, 3, 4];

export function updateEquipPetalColumn(game: Game) {
    const column = game.ui.equip_petal_column;
    column.children().remove();
    let index = 0;
    [0, 1, 2, 3, 4].forEach(() => {
        const petal_box = $(`<div class="equip-petals equip-${index}" rarity="none" petalName="Light"></div>`);
        const center = Vec2.new(20, 15);
        const radius = 8;

        const height = 50;
        const width = 50;

        const count = light_pieces.length;

        let rad = 0;

        column.append(petal_box);

        light_pieces.forEach(() => {
            const petal = $("<img alt='' class='piece-petal' src='../../../public/img/game/petal/light.svg'>");
            petal.css("width", "20%");
            petal.css("height", "20%");
            const { x, y } = Vec2.add(center, Graphics.getPositionOnCircleByRadians(rad, radius));

            petal.css("top", `${y / height * 100}%`);
            petal.css("left", `${x / width * 100}%`);

            rad += P2 / count;

            petal_box.append(petal);
        });
        index += 1;
    });
}
