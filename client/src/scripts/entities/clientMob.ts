import { ClientEntity } from "./clientEntity";
import { EntityType, GameConstants } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { Text, Graphics } from "pixi.js";
import { EasingFunctions, MathGraphics, MathNumeric } from "@common/utils/math.ts";
import { MobDefinition } from "@common/definitions/mob.ts";
import { Vec2, Vector } from "@common/utils/vector.ts";

export class ClientMob extends ClientEntity {
    type = EntityType.Mob;

    images = {
        body: new GameSprite()
    };

    healthPercent = 1;
    healthBar = new Graphics();

    direction: Vector = Vec2.new(0, 0);

    constructor(game: Game, id: number) {
        super(game, id);
        this.images.body.setZIndex(0)

        this.healthBar.position.set(0, 50);

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body,
            this.healthBar
        );
    }

    render(): void {
        this.container.position =
            Vec2.targetEasing(this.container.position, Camera.vecToScreen(this.position), 8);
        this.images.body.rotation =
            Vec2.directionToRadians(Vec2.targetEasing(Vec2.radiansToDirection(this.images.body.rotation), this.direction, 8));
    }

    updateFromData(data: EntitiesNetData[EntityType.Mob], isNew: boolean): void {
        this.position = data.position;
        this.direction = data.direction;

        this.render()

        const radius = MathNumeric.clamp(
            Camera.unitToScreen(data.definition.hitboxRadius) * 2,
            80,
            Infinity
        );

        if (isNew) {
            this.container.position = Camera.vecToScreen(this.position);

            this.images.body
                .setFrame(`${data.definition.idString}.svg`)
                .setScaleByUnitRadius(data.definition.hitboxRadius)

            const healthBarY = Camera.unitToScreen(data.definition.hitboxRadius + 5 / 20);
            this.healthBar.position.set(0, healthBarY);
        }


        if (data.full){
            this.healthPercent = data.full.healthPercent
            this.drawHealthBar(radius)
        }
    }

    drawHealthBar(width: number): void {
        const healthbarWidth = width;
        const fillWidth = healthbarWidth * this.healthPercent;

        this.healthBar.visible = this.healthPercent < 0.999;
        this.healthBar.clear()
            .roundRect(-healthbarWidth / 2, 0, healthbarWidth, 10)
            .fill({
                color: 0x000000,
                alpha: 0.3
            })
            .roundRect((-healthbarWidth + 5) / 2, 3 / 2, fillWidth - 5, 7)
            .fill({
                color: 0x87e63e
            });
    }

    destroy() {
        this.game.camera.container.removeChild(this.container);
    }
}
