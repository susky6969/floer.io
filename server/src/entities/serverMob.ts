import { isDamageableEntity, ServerEntity } from "./serverEntity";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { Game } from "../game";
import { MobCategory, MobDefinition } from "../../../common/src/definitions/mob";
import { MathGraphics, MathNumeric } from "../../../common/src/utils/math";
import { ServerPlayer } from "./serverPlayer";
import { Random } from "../../../common/src/utils/random";

export class ServerMob extends ServerEntity<EntityType.Mob> {
    type: EntityType.Mob = EntityType.Mob;
    private dead: boolean = false;

    get position(): Vector {
        return this.hitbox.position;
    }

    set position(position: Vector) {
        if (this._oldPosition && this._oldPosition == position) return;

        this.hitbox.position = this.game.clampPosition(position, this.hitbox.radius);
        this._position = this.hitbox.position;

        if (!this.hasInited) return;
        // send data
        this.setDirty();
        this.game.grid.updateEntity(this);
    }

    hitbox: CircleHitbox;
    definition: MobDefinition;

    readonly damage: number;
    _health!: number;
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

    constructor(game: Game, position: Vector, definition: MobDefinition) {
        super(game, position);
        this.definition = definition;
        this.hitbox = new CircleHitbox(definition.hitboxRadius);
        this.damage = definition.damage;
        this._health = definition.health;
        this.weight = definition.hitboxRadius;

        this.game.grid.addEntity(this);
        this.position = position;
    }

    tick(): void{
        if (this.aggroTarget) {
            if (!this.aggroTarget.dead) {
                this.direction = MathGraphics.directionBetweenPoints(this.aggroTarget.position, this.position);
                this.position = Vec2.add(
                    this.position, Vec2.mul(
                        this.direction, this.definition.speed * this.game.dt
                    )
                );
            } else {
                this.aggroTarget = undefined;
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

        const entities = this.game.grid.intersectsHitbox(this.hitbox);

        for (const entity of entities) {
            if (!isDamageableEntity(entity)) continue;
            const collision = this.hitbox.getIntersection(entity.hitbox);
            switch (entity.type) {
                case EntityType.Player:
                    if (collision) {
                        this.position = Vec2.sub(
                            this.position, Vec2.mul(collision.dir, collision.pen / this.weight)
                        );
                        if (this.definition.damage)
                            entity.receiveDamage(this.definition.damage, this);
                    }
                    break;
                case EntityType.Petal:
                    if (collision && this.definition.damage) {
                        entity.receiveDamage(this.definition.damage, this);
                    }
                    break;
                case EntityType.Mob:
                    if (entity === this) continue;

                    if (collision) {
                        this.position = Vec2.sub(
                            this.position, Vec2.mul(collision.dir, collision.pen)
                        );
                    }
            }
        }
    }

    receiveDamage(amount: number, source: ServerPlayer | ServerMob) {
        if (this.dead) return;

        if (!this.aggroTarget && source instanceof ServerPlayer) {
            this.aggroTarget = source;
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.dead = true;
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
