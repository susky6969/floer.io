import $ from "jquery";
import { ClientApplication } from "@/main.ts";
import { Config } from "@/config.ts";
import { GameOverPacket } from "@common/packets/gameOverPacket.ts";
import { Tween } from "@tweenjs/tween.js"
import { Game } from "@/scripts/game.ts";

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

    readonly settingsButton = $<HTMLDivElement>("#btn-settings");

    readonly settingsDialog = $<HTMLDivElement>("#settings-dialog");

    openedDialog?: JQuery<HTMLDivElement>;
    game: Game;

    constructor(app: ClientApplication) {
        this.app = app;
        this.game = app.game;

        this.readyButton.on("click", (e: Event) => {
            this.app.game.sendJoin();
        });

        this.continueButton.on("click", (e: Event) => {
            this.app.game.endGame();
        });

        this.settingsButton.on("click", (e: Event) => {
            this.toggleSettings();
        })

        this.gameOverScreen.css("display", "none");
    }

    toggleSettings(): void {
        if (this.openedDialog === this.settingsDialog) {
            this.settingsDialog.css("animation", "close_dialog 1s forwards");
        } else {
            this.settingsDialog.css("animation", "open_dialog 1s forwards");
        }
        this.openedDialog = this.openedDialog === this.settingsDialog ? undefined : this.settingsDialog
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
