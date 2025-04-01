import "./scss/main.scss";
import { Game } from "./scripts/game";
import { UI } from "@/ui.ts";

export class ClientApplication {
    ui = new UI(this);
    game = new Game(this);

    async init() {
        await this.game.init();
    }
}

void new ClientApplication().init();
