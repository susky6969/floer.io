import { ClientEntity } from "@/scripts/entities/clientEntity.ts";
import { EntityType } from "@common/constants.ts";
import { FloerSprite } from "../utils/pixi.ts";
import { Game } from "../game.ts";

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
