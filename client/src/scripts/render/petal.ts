import { Game } from "@/scripts/game.ts";
import $ from "jquery";
import { Vec2, Vector } from "@common/utils/vector.ts";
import * as math from "@/scripts/utils/math.ts";

const light_pieces = [0, 1, 2, 3, 4];

export function updateEquipPetalColumn(game: Game) {
    const column = game.uiManager.ui.equip_petal_column;
    column.children().remove();
    let index = 0;
    [0, 1, 2, 3, 4].forEach(e => {
        const petal_box = $(`<div class="equip-petals equip-${index}" rarity="none" petalName="Light"></div>`);
        const center = Vec2.new(20, 15);
        const radius = 8;

        const height = 50;
        const width = 50;

        const count = light_pieces.length;

        let rad = 0;

        column.append(petal_box);

        light_pieces.forEach(piece => {
            const petal = $("<img class=\"piece-petal\" src=\"res/game/petals/light.svg\"></img>");
            petal.css("width", "20%");
            petal.css("height", "20%");
            const x = center.x as number + Math.cos(rad) * radius;
            const y = center.y as number + Math.sin(rad) * radius;

            petal.css("top", `${y / height * 100}%`);
            petal.css("left", `${x / width * 100}%`);

            rad += math.P2 / count;

            petal_box.append(petal);
        });
        index += 1;
    });
}
