import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";

export class ClientPetal extends ClientEntity {
    type = EntityType.Petal;

    images = {
        body: new GameSprite("light.svg").setScale(0.2)
    };

    constructor(game: Game, id: number) {
        super(game, id);

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body
        );
    }

    render(): void {
        this.container.position = this.position;
    }

    destroy() {

    }
}
