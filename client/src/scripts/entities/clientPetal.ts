import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite, getGameAssetsPath } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { Vec2 } from "@common/utils/vector.ts";
import { Tween } from '@tweenjs/tween.js';
import { PetalDefinition } from "@common/definitions/petal.ts";
import { EasingFunctions } from "@common/utils/math.ts";

export class ClientPetal extends ClientEntity {
    type = EntityType.Petal;

    images = {
        body: new GameSprite()
    };

    angle: number = 0;

    definition!: PetalDefinition;

    reloadAnimation?: Tween;

    visible: boolean = true;

    constructor(game: Game, id: number) {
        super(game, id);

        this.container.zIndex = 1;

        this.images.body.anchor.set(0.5);

        this.game.camera.addObject(this.container);

        this.container.addChild(
            this.images.body
        );
    }

    render(): void {
        if (this.reloadAnimation) {
            this.reloadAnimation.update();
        }else {
            this.container.position = Vec2.targetEasing(this.container.position, Camera.vecToScreen(this.position), 8)
        }

        if (this.definition && !this.definition.isDuplicate) {
            this.angle += this.definition.selfRotation;
            this.images.body.setAngle(this.angle);
        }
    }

    changeVisibleTo(visible: boolean): void {
        if (this.visible !== visible) {
            this.visible = visible;
            if (visible) {
                this.images.body.setVisible(visible);
                this.images.body.setAlpha(1);
                this.images.body.setScaleByUnitRadius(this.definition.hitboxRadius)
            } else {
                this.reloadAnimation = new Tween({ alpha: 1, scale: this.definition.hitboxRadius })
                    .to({ alpha: 0, scale: this.definition.hitboxRadius * 4 }, 100)
                    .easing(EasingFunctions.sineOut)
                    .onUpdate((obj) => {
                        this.images.body.alpha = obj.alpha;
                        this.images.body.setScaleByUnitRadius(obj.scale);
                    }).onComplete(() => {
                        this.images.body.setVisible(visible)
                        this.reloadAnimation = undefined;
                    }).start()
            }
        }
    }

    updateFromData(data: EntitiesNetData[EntityType.Petal], _isNew: boolean): void {
        this.position = data.position;

        this.render();

        if (_isNew){
            this.definition = data.definition;

            this.container.position = Camera.vecToScreen(this.position);

            this.images.body
                .setFrame(getGameAssetsPath("petal", this.definition))
                .setScaleByUnitRadius(data.definition.hitboxRadius)

            this.images.body.setVisible(!data.isReloading);
        }

        this.changeVisibleTo(!data.isReloading);
    }
}
