import $ from "jquery";
import { ClientApplication } from "@/main.ts";
import { Config } from "@/config.ts";
import { GameOverPacket } from "@common/packets/gameOverPacket.ts";

export class UI {
    readonly app: ClientApplication;

    readonly canvas = $<HTMLCanvasElement>("#canvas");
    readonly readyButton = $<HTMLDivElement>("#btn-ready");

    readonly outGameScreen =  $<HTMLDivElement>("#out-game-screen");

    readonly equipPetalColumn= $<HTMLDivElement>("#equipped-petals-column");

    readonly nameInput = $<HTMLInputElement>("#name");

    readonly gameOverScreen = $<HTMLDivElement>("#game-over-screen");

    readonly gameOverMurderer = $<HTMLDivElement>("#game-over-murderer");

    readonly continueButton = $<HTMLDivElement>("#btn-continue");

    constructor(app: ClientApplication) {
        this.app = app;

        this.readyButton.on("click", (e: Event) => {
            app.game.connect(Config.address);
        });

        this.continueButton.on("click", (e: Event) => {
            app.game.endGame();
            this.gameOverScreen.css("display", "none");
        });

        this.gameOverScreen.css("display", "none");
    }

    showGameOverScreen(packet: GameOverPacket) {
        this.gameOverScreen.css("display", "flex");
        this.gameOverMurderer.attr("textStroke", packet.murderer);
        this.gameOverMurderer.text(packet.murderer);
    }
}
