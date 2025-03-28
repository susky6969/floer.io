import $ from "jquery";
import { Game } from "@/scripts/game";

export class UIManager {
    readonly game: Game;

    readonly ui = Object.freeze({
        canvas: $<HTMLCanvasElement>("#canvas"),
        ready_button: $<HTMLDivElement>("#btn-ready"),

        out_game_screen: $<HTMLDivElement>("#out-game-screen"),

        equip_petal_column: $<HTMLDivElement>("#equip-petal-column")
    });

    constructor(game: Game) {
        this.game = game;
    }
}
