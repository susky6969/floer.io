import { type GameEntity } from "@common/utils/entityPool.ts";
import { EntityType } from "@common/constants";
import { Vec2, Vector } from "@common/utils/vector.ts";
import { Game } from "../game.ts";

export abstract class ClientEntity implements GameEntity {
    readonly game: Game;

    readonly id: number;
    abstract readonly type: EntityType;

    damageable = false;
    destroyed = false;

    private __position: Vector = Vec2.new(0, 0);
    get position(): Vector {
        return this.__position;
    }

    set position(Vector: Vector) {
        this.__position = Vector;
    }

    constructor(game: Game, id: number) {
        this.game = game;
        this.id = id;
    }

    abstract update(): void;
}
