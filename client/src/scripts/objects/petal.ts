import { GameObject } from "@/scripts/objects/gameObject.ts";
import { ObjectType } from "@common/constants.ts";
import { FloerSprite } from "../utils/pixi.ts";
import { Game } from "../game.ts";
import { Container } from "pixi.js";

export class Petal extends GameObject {
    type = ObjectType.Petal;

    images = {
        body: new FloerSprite("petal_light").setScale(0.2)
    };

    container: Container = new Container();

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
