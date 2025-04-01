import $ from "jquery";
import { ClientApplication } from "@/main.ts";
import { Config } from "@/config.ts";

export class UI {
    readonly app: ClientApplication;

    readonly canvas = $<HTMLCanvasElement>("#canvas");
    readonly ready_button = $<HTMLDivElement>("#btn-ready");

    readonly out_game_screen =  $<HTMLDivElement>("#out-game-screen");

    readonly equip_petal_column= $<HTMLDivElement>("#equip-petal-column");

    constructor(app: ClientApplication) {
        this.app = app;

        this.ready_button.on("click", (e: Event) => {
            this.canvas.css("display", "block");
            this.out_game_screen.css("display", "none");

            app.game.connect(Config.address);
        });
    }
}
