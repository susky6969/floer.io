import $ from "jquery";
import { ClientApplication } from "@/main.ts";
import { Config } from "@/config.ts";

export class UI {
    readonly app: ClientApplication;

    readonly canvas = $<HTMLCanvasElement>("#canvas");
    readonly readyButton = $<HTMLDivElement>("#btn-ready");

    readonly outGameScreen =  $<HTMLDivElement>("#out-game-screen");

    readonly equipPetalColumn= $<HTMLDivElement>("#equipped-petals-column");

    readonly nameInput = $<HTMLInputElement>("#name");

    constructor(app: ClientApplication) {
        this.app = app;

        this.readyButton.on("click", (e: Event) => {
            app.game.connect(Config.address);
        });
    }
}
