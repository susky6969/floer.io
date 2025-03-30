import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { FloerSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";

export class Petal extends ClientEntity {
    type = EntityType.Petal;

    images = {
        body: new FloerSprite("petal_light").setScale(0.2)
    };

    constructor(game: Game, id: number) {
        super(game, id);

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body
        );
    }

    update(): void {
        this.container.position = this.position;
    }
}
