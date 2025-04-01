import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";

export class ClientPlayer extends ClientEntity {
    type = EntityType.Player;

    images = {
        body: new GameSprite("flower_body.svg")
    };

    constructor(game: Game, id: number) {
        super(game, id);

        this.container.addChild(
            this.images.body
        );

        this.game.camera.addObject(this.container);
    }

    render(): void {
        this.container.position = this.position;
    }

    destroy() {

    }
}
