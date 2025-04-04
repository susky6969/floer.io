import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { Vec2 } from "@common/utils/vector.ts";

export class ClientPetal extends ClientEntity {
    type = EntityType.Petal;

    images = {
        body: new GameSprite()
    };

    angle: number = 0;

    constructor(game: Game, id: number) {
        super(game, id);
        this.images.body.setZIndex(0)

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body
        );
    }

    render(): void {
        this.container.position = Vec2.targetEasing(this.container.position, Camera.vecToScreen(this.position), 8);

        this.angle += 0.1
        this.images.body.setAngle(this.angle);
    }

    updateFromData(data: EntitiesNetData[EntityType.Petal], _isNew: boolean): void {
        this.position = data.position;
        this.render();

        this.images.body
            .setFrame(`${data.definition.idString}.svg`)
            .setScaleByUnit(data.definition.hitboxRadius)
        this.images.body.setVisible(!data.isReloading)
        if (_isNew){
            this.container.position = Camera.vecToScreen(this.position);
        }
    }

    destroy() {
        this.game.camera.container.removeChild(this.container);
    }
}
