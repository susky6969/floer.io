import { damageableEntity, isDamageableEntity, ServerEntity } from "./serverEntity";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { Game } from "../game";
import { MobCategory, MobDefinition } from "../../../common/src/definitions/mob";
import { MathGraphics, MathNumeric } from "../../../common/src/utils/math";
import { ServerPlayer } from "./serverPlayer";
import { Random } from "../../../common/src/utils/random";
import { CollisionResponse } from "../../../common/src/utils/collision";

export class ServerMob extends ServerEntity<EntityType.Mob> {
    type: EntityType.Mob = EntityType.Mob;

    hitbox: CircleHitbox;
    definition: MobDefinition;

    get name(): string {
        return this.definition.displayName
    }

    readonly damage: number;

    private _health!: number;
    get health(): number {
        return this._health;
    }

    set health(value: number) {
        if (value === this._health) return
        this._health = MathNumeric.clamp(value, 0, this.definition.health);

        this.setFullDirty();
    }

    aggroTarget?: ServerPlayer;
    weight: number;
    elasticity: number;

    _direction: Vector = Vec2.new(0, 0);

    get direction(): Vector {
        return this._direction
    }

    set direction(value: Vector) {
        if (value === this._direction) return
        this._direction = value;

        this.setDirty();
    }

    walkingReload: number = 0;
    walkingTime: number = 0;

    canReceiveDamageFrom(entity: ServerEntity): boolean {
        return !(entity instanceof ServerMob);
    }

    constructor(game: Game, position: Vector, definition: MobDefinition) {
        super(game, position);
        this.definition = definition;
        this.hitbox = new CircleHitbox(definition.hitboxRadius);
        this.damage = definition.damage;
        this.health = definition.health;
        this.weight = definition.hitboxRadius;
        this.elasticity = this.weight * 2.5;

        this.game.grid.addEntity(this);
        this.position = position;
    }

    tick(): void{
        if (this.aggroTarget) {
            if (this.aggroTarget.destroyed) {
                this.aggroTarget = undefined;
            } else {
                this.direction = MathGraphics.directionBetweenPoints(this.aggroTarget.position, this.position);
                this.position = Vec2.add(
                    this.position, Vec2.mul(
                        this.direction, this.definition.speed * this.game.dt
                    )
                );
            }
        }else {
            if (this.definition.category !== MobCategory.Fixed) {
                this.walkingReload += this.game.dt;
                if (this.walkingReload >= GameConstants.mob.walkingReload) {
                    if (this.walkingTime === 0) this.direction = Random.vector(-1, 1, -1, 1)

                    this.position = Vec2.add(
                        this.position, Vec2.mul(
                            this.direction, this.definition.speed * this.game.dt / GameConstants.mob.walkingTime
                        )
                    );

                    this.walkingTime += this.game.dt;

                    if (this.walkingTime >= GameConstants.mob.walkingTime) {
                        this.walkingReload = 0;
                        this.walkingTime = 0;
                    }
                }
            }
        }
    }

    dealDamageTo(entity: damageableEntity): void{
        if (entity.canReceiveDamageFrom(this))
            entity.receiveDamage(this.damage, this);
    }

    receiveDamage(amount: number, source: ServerPlayer | ServerMob) {
        if (!this.isActive()) return;

        if (!this.aggroTarget && source instanceof ServerPlayer) {
            this.aggroTarget = source;
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.destroy();
        }
    }

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            definition: this.definition,
            direction: this.direction,
            full: {
                healthPercent: this.health / this.definition.health
            }
        };
    };
}
