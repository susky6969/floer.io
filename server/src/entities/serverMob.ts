import { ServerEntity } from "./serverEntity";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { Game } from "../game";
import { MobCategory, MobDefinition } from "../../../common/src/definitions/mob";
import { MathGraphics, MathNumeric } from "../../../common/src/utils/math";
import { ServerPlayer } from "./serverPlayer";
import { Random } from "../../../common/src/utils/random";
import { PetalDefinition, Petals } from "../../../common/src/definitions/petal";
import { spawnLoot } from "../utils/loot";
import { ServerProjectile } from "./serverProjectile";
import { Modifiers } from "../../../common/src/typings";
import { damageableEntity, damageSource } from "../typings";

export class ServerMob extends ServerEntity<EntityType.Mob> {
    type: EntityType.Mob = EntityType.Mob;

    hitbox: CircleHitbox;
    definition: MobDefinition;
    modifiers: Modifiers = GameConstants.mob.defaultModifiers();
    otherModifiers: Partial<Modifiers>[] = [];

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

    _direction: Vector = Vec2.new(0, 0);

    get direction(): Vector {
        return this._direction
    }

    set direction(value: Vector) {
        if (value === this._direction) return
        this._direction = value;

        this.setDirty();
    }

    get speed(): number {
        if (this.definition.category !== MobCategory.Fixed) return this.definition.speed * this.modifiers.speed;
        return 0;
    }

    walkingReload: number = 0;
    walkingTime: number = 0;
    shootReload: number = 0;

    canReceiveDamageFrom(entity: ServerEntity): boolean {
        if (entity instanceof ServerProjectile)
            return entity.source.type != this.type;
        return !(entity instanceof ServerMob);
    }

    constructor(game: Game, position: Vector, definition: MobDefinition) {
        super(game, position);
        this.definition = definition;
        this.hitbox = new CircleHitbox(definition.hitboxRadius);
        this.damage = definition.damage;
        this.health = definition.health;

        this.weight = definition.hitboxRadius * 10;

        this.game.grid.addEntity(this);
        this.position = position;
    }

    changeAggroTo(entity?: ServerEntity): void {
        if (![MobCategory.Enemy, MobCategory.Passive].includes(this.definition.category)) return;

        if (this.aggroTarget && !entity) {
            this.aggroTarget = undefined;
        } else if (!this.aggroTarget && entity) {
            if (!(entity instanceof ServerPlayer) ) return;
            this.aggroTarget = entity;
        }
    }

    tick(): void{
        super.tick()

        if (this.definition.category !== MobCategory.Fixed) {
            if (this.aggroTarget) {
                if (this.aggroTarget.destroyed) {
                    this.changeAggroTo();
                } else {
                    this.direction = MathGraphics.directionBetweenPoints(this.aggroTarget.position, this.position);

                    if (this.definition.shootable) {
                        this.shootReload += this.game.dt;
                        if (this.shootReload >= this.definition.shootSpeed) {
                            // Vec2.add(this.position,Vec2.mul(this.direction, this.hitbox.radius))
                            new ServerProjectile(this,
                                this.position,
                                this.direction, this.definition.shoot);
                            this.shootReload = 0;
                        }
                    }
                    if (this.definition.reachingAway) {
                        if (Vec2.distance(this.position, this.aggroTarget.position) > 15){
                            this.setAcceleration(Vec2.mul(
                                this.direction, this.speed
                            ));
                        }
                    } else {
                        this.setAcceleration(Vec2.mul(
                            this.direction, this.speed
                        ));
                    }
                }
            }else {
                    this.walkingReload += this.game.dt;
                    if (this.walkingReload >= GameConstants.mob.walkingReload) {
                        if (this.walkingTime === 0) this.direction = Random.vector(-1, 1, -1, 1)
                        this.setAcceleration(Vec2.mul(
                            this.direction, this.speed * GameConstants.mob.walkingTime
                        ))

                        this.walkingTime += this.game.dt;

                        if (this.walkingTime >= GameConstants.mob.walkingTime) {
                            this.walkingReload = 0;
                            this.walkingTime = 0;
                        }
                    }

                    if (this.definition.category === MobCategory.Enemy && !this.aggroTarget) {
                        const aggro = new CircleHitbox(
                            this.definition.aggroRadius, this.position
                        );

                        const entities =
                            this.game.grid.intersectsHitbox(aggro);

                        for (const entity of entities) {
                            if (!(entity instanceof ServerPlayer)) continue;
                            if (aggro.collidesWith(entity.hitbox)) {
                                this.changeAggroTo(entity);
                            }
                        }
                    }
            }
        }

        this.updateModifiers();
    }

    dealDamageTo(to: damageableEntity): void{
        if (to.canReceiveDamageFrom(this))
            to.receiveDamage(this.damage, this);
    }

    receiveDamage(amount: number, source: damageSource, disableEvent?: boolean): void {
        if (!this.isActive()) return;

        this.changeAggroTo(source)

        this.health -= amount;

        if (this.health <= 0) {
            this.destroy();

            if (source instanceof ServerPlayer){
                source.addExp(this.definition.exp)
            }
        }
    }

    updateModifiers(): void {
        let modifiersNow = GameConstants.mob.defaultModifiers();

        this.effects.effects.forEach(effect => {
            if (effect.modifier) {
                modifiersNow = this.calcModifiers(modifiersNow, effect.modifier);
            }
        })

        this.otherModifiers.forEach(effect => {
            modifiersNow = this.calcModifiers(modifiersNow, effect)
        })

        this.otherModifiers = [];

        this.modifiers = modifiersNow;
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

    destroy() {
        super.destroy();

        const lootTable = this.definition.lootTable;

        let loots: PetalDefinition[] = []

        const randomMax = 10000;

        for (const lootsKey in lootTable) {
            if (!Petals.hasString(lootsKey)) continue;
            const random = Random.int(0, randomMax);
            if (random <= lootTable[lootsKey] * randomMax){
                loots.push(Petals.fromString(lootsKey));
            }
        }

        spawnLoot(this.game, loots, this.position)
    }
}
