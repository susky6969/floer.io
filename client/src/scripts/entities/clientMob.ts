import { ClientEntity } from "./clientEntity";
import { EntityType, GameConstants } from "@common/constants";
import { GameSprite, getGameAssetsPath } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { Text, Graphics, ColorMatrixFilter } from "pixi.js";
import { EasingFunctions, MathGraphics, MathNumeric } from "@common/utils/math.ts";
import { MobDefinition } from "@common/definitions/mob.ts";
import { Vec2, Vector } from "@common/utils/vector.ts";
import { Rarity } from "@common/definitions/rarity.ts";
import { Tween } from '@tweenjs/tween.js';

const defaultImageSize = 200;

export class ClientMob extends ClientEntity {
    type = EntityType.Mob;

    images = {
        body: new GameSprite()
    };

    healthPercent = 1;
    healthBar = new Graphics();
    name: Text;
    rarity: Text;

    direction: Vector = Vec2.new(0, 0);

    definition!: MobDefinition;

    lastGettingDamage: number = 0;

    constructor(game: Game, id: number) {
        super(game, id);

        this.container.zIndex = 0;

        this.images.body.anchor.set(0.5);

        this.healthBar.position.set(0, 50);

        this.game.camera.addObject(this.container);

        this.name = new Text({
            text: "",
            style: {
                fontFamily: 'Ubuntu',
                fontSize: 11,
                fill: "#fff",
                stroke: {color: "#000", width: 2}
            }
        });

        this.rarity = new Text({
            text: "",
            style: {
                fontFamily: 'Ubuntu',
                fontSize: 11,
                fill: "#fff",
                stroke: {color: "#000", width: 2}
            }
        });

        this.name.anchor.y = 0.5;
        this.rarity.anchor.x = 1;


        this.container.addChild(
            this.images.body,
            this.healthBar,
            this.name,
            this.rarity
        );
    }

    render(): void {
        this.container.position =
            Vec2.targetEasing(this.container.position, Camera.vecToScreen(this.position), 8);

        this.images.body.rotation =
            Vec2.directionToRadians(Vec2.targetEasing(Vec2.radiansToDirection(this.images.body.rotation), this.direction, 8));

        if (this.definition.hideInformation) {
            this.name.visible = false;
            this.rarity.visible = false;
        }

        this.name.text = this.definition.displayName;
        const rarity = Rarity.fromString(this.definition.rarity);
        this.rarity.text = rarity.displayName;
        this.rarity.style.fill = rarity.color;
    }

    updateFromData(data: EntitiesNetData[EntityType.Mob], isNew: boolean): void {
        this.position = data.position;
        this.direction = data.direction;
        this.definition = data.definition;

        this.render()

        const radius = MathNumeric.clamp(
            Camera.unitToScreen(this.definition.hitboxRadius) * 2,
            80,
            Infinity
        );

        if (isNew) {
            this.container.position = Camera.vecToScreen(this.position);

            this.images.body
                .setFrame(getGameAssetsPath("mob", this.definition))
                .setScaleByUnitRadius(data.definition.hitboxRadius)
                .setRotation(Vec2.directionToRadians(data.direction));

            const healthBarY = Camera.unitToScreen(this.definition.hitboxRadius + 5 / 20);
            this.healthBar.position.set(0, healthBarY);
            this.name.position.y = healthBarY - 7;
            this.rarity.position.y = healthBarY + 7;

            if (this.definition.images?.width) {
                this.images.body.anchor.x = 0.5 + (
                    (defaultImageSize - this.definition.images.width) / defaultImageSize
                ) / 2;
            }

            if (this.definition.images?.height) {
                this.images.body.anchor.y = 0.5 + (
                    (defaultImageSize - this.definition.images.height) / defaultImageSize
                ) / 2;
            }
        } else {
            if (data.full) {
                if (this.healthPercent > data.full.healthPercent) {
                    this.getDamageAnimation()
                }
            }
        }

        if (data.full){

            this.healthPercent = data.full.healthPercent;

            this.drawHealthBar(radius)
        }
    }

    getDamageAnimation() {
        if (Date.now() - this.lastGettingDamage < 90) return
        this.lastGettingDamage = Date.now();
        this.game.addTween(
            new Tween({ color: { r: 255, g: 0, b: 0 } })
                .to({ color: { r: 255, g: 255, b: 255 } }, 30 )
                .onUpdate(d => {
                    this.images.body.setTint(d.color);
                })
        )

        this.game.addTween(
            new Tween({ brightness: 1 })
                .delay(30)
                .to({ brightness: 3 }, 30 )
                .onUpdate(d => {
                    const filter = new ColorMatrixFilter();
                    filter.brightness(d.brightness, false);
                    this.images.body.filters = filter;
                })
        )

        this.game.addTween(
            new Tween({ brightness: 3 })
                .delay(60)
                .to({ brightness: 1 }, 30 )
                .onUpdate(d => {
                    const filter = new ColorMatrixFilter();
                    filter.brightness(d.brightness, false);
                    this.images.body.filters = filter;
                })
        )
    }

    drawHealthBar(width: number): void {
        const healthbarWidth = width;
        const fillWidth = healthbarWidth * this.healthPercent;

        if (this.definition.hideInformation) this.healthBar.visible = this.healthPercent < 0.999;

        this.healthBar.clear()
            .roundRect((-healthbarWidth - 5) / 2, 0, healthbarWidth + 5, 10)
            .fill({
                color: 0x000000,
                alpha: 0.3
            })
            .roundRect(-healthbarWidth / 2, 3 / 2, fillWidth, 7)
            .fill({
                color: 0x87e63e
            });

        this.name.position.x = -healthbarWidth / 2;
        this.rarity.position.x = (healthbarWidth + 5) / 2;
    }

    destroy() {
        this.game.addTween(new Tween({ scale: this.images.body.scale.x, alpha: 1 },)
            .to({ scale: this.images.body.scale.x * 3, alpha: 0 }, 100 )
            .onUpdate(d => {
                this.images.body.setScale(d.scale);
                this.images.body.setAlpha(d.alpha);
            })
            , super.destroy.bind(this)
        )
    }
}
