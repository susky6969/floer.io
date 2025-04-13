import $ from "jquery";
import { ClientApplication } from "@/main.ts";
import { Config } from "@/config.ts";
import { GameOverPacket } from "@common/packets/gameOverPacket.ts";

export class UI {
    readonly app: ClientApplication;

    readonly canvas = $<HTMLCanvasElement>("#canvas");
    readonly readyButton = $<HTMLDivElement>("#btn-ready");

    readonly inGameScreen =  $<HTMLDivElement>("#in-game-screen");
    readonly outGameScreen =  $<HTMLDivElement>("#out-game-screen");

    readonly main =  $<HTMLDivElement>("#main");
    readonly hud = $<HTMLDivElement>("#hud");

    readonly petalColumn= $<HTMLDivElement>(".petal-column");
    readonly equippedPetalRow= $<HTMLDivElement>(".equipped-petals-row");
    readonly preparationPetalRow= $<HTMLDivElement>(".preparation-petals-row");

    readonly nameInput = $<HTMLInputElement>("#name");

    readonly gameOverScreen = $<HTMLDivElement>("#game-over-screen");

    readonly gameOverMurderer = $<HTMLDivElement>("#game-over-murderer");

    readonly gameOverKills = $<HTMLDivElement>("#game-over-kills");

    readonly continueButton = $<HTMLDivElement>("#btn-continue");

    readonly moveRight = $<HTMLDivElement>("#move-right");

    readonly moveRightTime = $<HTMLDivElement>("#move-right-time");

    readonly deletePetal = $<HTMLDivElement>("<div id='delete-petal'></div>");

    readonly petalInformation =
        $<HTMLDivElement>("<div id='petal-information'></div>");

    constructor(app: ClientApplication) {
        this.app = app;

        this.readyButton.on("click", (e: Event) => {
            this.app.game.sendJoin();
        });

        this.continueButton.on("click", (e: Event) => {
            this.app.game.endGame();
        });

        this.gameOverScreen.css("display", "none");
    }

    showGameOverScreen(packet: GameOverPacket) {
        this.gameOverScreen.css("display", "flex");

        this.gameOverMurderer.attr("textStroke", packet.murderer);
        this.gameOverMurderer.text(packet.murderer);
        const kills = `You killed ${packet.kills} flower${packet.kills > 1 ? "s" : ""} this run.`
        this.gameOverKills.attr("textStroke", kills);
        this.gameOverKills.text(kills);
    }

    showOverleveled(time?: number) {
        if (!time && time !== 0) {
            this.moveRight.css("display", "none");
            return;
        }

        let content = `${time}s`;
        if (time <= 0) content = "MOVE RIGHT NOW";
        this.moveRight.css("display", "block");
        this.moveRightTime.attr("textStroke", content);
        this.moveRightTime.text(content);
    }
}
