import { type GameEntity } from "@common/utils/entityPool";
import { EntityType } from "@common/constants";
import { Vec2, Vector } from "@common/utils/vector";
import { Game } from "@/scripts/game";
import { Container } from "pixi.js";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";

export abstract class ClientEntity implements GameEntity {
    readonly game: Game;

    readonly id: number;
    abstract readonly type: EntityType;

    container = new Container();

    oldPosition: Vector = Vec2.new(0, 0);
    position: Vector = Vec2.new(0, 0);

    protected constructor(game: Game, id: number) {
        this.game = game;
        this.id = id;
    }

    updateFromData(_data: EntitiesNetData[EntityType], _isNew: boolean): void {}

    abstract render(): void;

    destroy() {
        this.game.camera.container.removeChild(this.container);
    }
}
