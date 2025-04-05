import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { PetalDefinition } from "@common/definitions/petal.ts";
import { Graphics } from "pixi.js";

export class ClientLoot extends ClientEntity {
    type = EntityType.Loot;

    images = {
        body: new GameSprite(),
        background: new Graphics()
    };

    definition!: PetalDefinition;

    constructor(game: Game, id: number) {
        super(game, id);
        this.images.body.setZIndex(0);
        this.images.background.zIndex = -1;

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body,
            this.images.background
        );
    }

    render(): void {
        this.container.position =Camera.vecToScreen(this.position);
    }

    updateFromData(data: EntitiesNetData[EntityType.Petal], isNew: boolean): void {
        this.position = data.position;

        if (isNew){
            this.definition = data.definition;

            this.images.body
                .setFrame(`${data.definition.idString}.svg`)
                .setScaleByUnitRadius(data.definition.hitboxRadius)

            this.images.background.clear()
                .rect(-25, -25, 50, 50)
                .fill(0xff0000);
        }
    }
}
