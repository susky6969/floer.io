import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";

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
        const pos = Camera.vecToScreen(this.position);
        this.container.position = pos;
    }

    updateFromData(_data: EntitiesNetData[EntityType.Player], _isNew: boolean): void {
        this.position = _data.position;
    }

    destroy() {

    }
}
