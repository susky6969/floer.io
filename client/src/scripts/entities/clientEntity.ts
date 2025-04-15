import { type GameEntity } from "@common/utils/entityPool";
import { EntityType } from "@common/constants";
import { Vec2, Vector } from "@common/utils/vector";
import { Game } from "@/scripts/game";
import { Container, ColorMatrixFilter } from "pixi.js";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { GameSprite } from "@/scripts/utils/pixi.ts";
import { Tween } from "@tweenjs/tween.js";

export abstract class ClientEntity implements GameEntity {
    readonly game: Game;

    readonly id: number;
    abstract readonly type: EntityType;

    container = new Container();

    oldPosition: Vector = Vec2.new(0, 0);
    position: Vector = Vec2.new(0, 0);

    lastGettingDamage: number = 0;

    protected constructor(game: Game, id: number) {
        this.game = game;
        this.id = id;
    }

    updateFromData(_data: EntitiesNetData[EntityType], _isNew: boolean): void {}

    abstract render(): void;

    getDamageAnimation(image: GameSprite) {
        if (Date.now() - this.lastGettingDamage < 600) return
        const filter = new ColorMatrixFilter();
        image.filters = filter;
        this.lastGettingDamage = Date.now();
        this.game.addTween(
            new Tween({ color: { r: 255, g: 0, b: 0 } })
                .to({ color: { r: 255, g: 255, b: 255 } }, 30 )
                .onUpdate(d => {
                    image.setTint(d.color);
                })
        )

        this.game.addTween(
            new Tween({ brightness: 1 })
                .delay(30)
                .to({ brightness: 3 }, 30 )
                .onUpdate(d => {
                    filter.brightness(d.brightness, false);
                })
        )

        this.game.addTween(
            new Tween({ brightness: 3 })
                .delay(60)
                .to({ brightness: 1 }, 30 )
                .onUpdate(d => {
                    filter.brightness(d.brightness, false);
                })
        )
    }

    destroy() {
        this.game.camera.container.removeChild(this.container);
    }
}
