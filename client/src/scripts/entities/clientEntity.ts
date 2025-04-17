import { type GameEntity } from "@common/utils/entityPool";
import { EntityType } from "@common/constants";
import { Vec2, Vector } from "@common/utils/vector";
import { Game } from "@/scripts/game";
import { Container, ColorMatrixFilter } from "pixi.js";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { GameSprite } from "@/scripts/utils/pixi.ts";
import { Tween } from "@tweenjs/tween.js";
import { MathNumeric } from "@common/utils/math.ts";
import { Camera } from "@/scripts/render/camera.ts";

export abstract class ClientEntity implements GameEntity {
    readonly game: Game;

    readonly id: number;
    abstract readonly type: EntityType;

    container = new Container();
    staticContainer: Container = new Container();

    lastReceivePacket: number = 0;

    oldPosition: Vector = Vec2.new(0, 0);
    _position: Vector = Vec2.new(0, 0);
    get position(): Vector {
        return this._position;
    }

    set position(position: Vector) {
        this.oldPosition = this.position;
        this._position = position;
    }

    oldDirection: Vector = Vec2.new(0, 0);
    _direction: Vector = Vec2.new(0, 0);

    get direction(): Vector {
        return this._direction;
    }

    set direction(direction: Vector) {
        this.oldDirection = this.direction;
        this._direction = direction;
    }

    lastGettingDamage: number = 0;

    protected constructor(game: Game, id: number) {
        this.game = game;
        this.id = id;
    }

    updateFromData(_data: EntitiesNetData[EntityType], _isNew: boolean): void {
        this.interpolationTick = 0;
        if (_isNew) {
            this.oldPosition = _data.position;
            this._position = _data.position;
        }
        this.render((Date.now() - this.lastReceivePacket) / 1000);
        this.lastReceivePacket = Date.now();
    }

    interpolationTick = 0;
    interpolationFactor = 0;

    render(dt: number): void {
        this.interpolationTick += dt;
        this.interpolationFactor = MathNumeric.clamp(
            this.interpolationTick / this.game.serverDt
            , 0, 1
        );
    }

    updateContainerPosition(n?: number): void {
        if (n) {
            this.container.position =
                Vec2.targetEasing(this.container.position, Camera.vecToScreen(this.position), n)
        } else {
            this.container.position = Camera.vecToScreen(
                Vec2.lerp(this.oldPosition, this.position, this.interpolationFactor)
            );
        }
        this.staticContainer.position = this.container.position;
    }

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
        this.game.camera.container.removeChild(this.staticContainer);
    }
}
