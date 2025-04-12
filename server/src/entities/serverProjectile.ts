import { ServerEntity } from "./serverEntity";
import { Vec2, Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
import { ProjectileDefinition, ProjectileParameters } from "../../../common/src/definitions/projectile";
import { AttributeEvents } from "../utils/attribute";
import { ServerPetal } from "./serverPetal";
import { collideableEntity, damageableEntity, damageSource } from "../typings";
import { Effect } from "../utils/effects";
import { ServerMob } from "./serverMob";

export class ServerProjectile extends ServerEntity<EntityType.Projectile> {
    type: EntityType.Projectile = EntityType.Projectile;

    hitbox: CircleHitbox;
    definition: ProjectileDefinition;
    parameters: ProjectileParameters;

    health: number = 0;
    damage: number = 0;

    despawnTime: number = 0;
    direction: Vector = Vec2.new(0, 0);
    source: damageSource;
    elasticity = 0;

    from?: ServerPetal;

    canReceiveDamageFrom(source: damageableEntity): boolean {
        if (this.definition.onGround) return false;
        switch (source.type) {
            case EntityType.Player:
                return source != this.source;
            case EntityType.Mob:
                return source.type != this.source.type;
            case EntityType.Petal:
                return source.owner != this.source;
            case EntityType.Projectile:
                if (source.source.type === EntityType.Mob)
                    return this.source.type != EntityType.Mob;
                return source.source != this.source;
        }
    }

    canCollideWith(source: collideableEntity): boolean {
        return this.canReceiveDamageFrom(source);
    }

    constructor(source: damageSource,
                position: Vector, direction: Vector, parameters: ProjectileParameters, from?: ServerPetal) {
        super(source.game, position);

        this.hitbox = new CircleHitbox(parameters.hitboxRadius);
        this.position = position;
        this.direction = direction;
        this.source = source;
        this.definition = parameters.definition;

        this.parameters = parameters;

        this.from = from;

        this.health = parameters.health;
        this.damage = parameters.damage;

        this.game.grid.addEntity(this);
    }

    tick(): void{
        super.tick();

        this.despawnTime += this.game.dt;
        if (this.despawnTime >= this.parameters.despawnTime) {
            this.destroy();
        }

        this.setAcceleration(Vec2.mul(this.direction, this.parameters.speed));
    }

    dealDamageTo(to: damageableEntity): void{
        if (to.canReceiveDamageFrom(this)) {
            to.receiveDamage(this.damage, this.source);
            if (this.from && this.source.type === EntityType.Player) {
                this.source.sendEvent(AttributeEvents.PROJECTILE_DEAL_DAMAGE, to, this.from)
            }
        }

        if (this.parameters.modifiers) {
            if (this.source.type === EntityType.Player) {
                if (to instanceof ServerMob
                    && to.definition.shootable
                    && to.definition.shoot.definition === this.definition
                ) return;
                new Effect({
                    effectedTarget: to,
                    source: this.source,
                    duration: 0.1,
                    modifier: this.parameters.modifiers
                }).start();

                return;
            }

            if (this.source.type != to.type) {
                new Effect({
                    effectedTarget: to,
                    source: this.source,
                    duration: 0.1,
                    modifier: this.parameters.modifiers
                }).start();
            }
        }
    }

    receiveDamage(amount: number, source: damageSource, disableEvent?: boolean) {
        if (!this.isActive()) return;
        this.health -= amount;

        if (this.health <= 0) {
            this.destroy();
        }
    }

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            hitboxRadius: this.parameters.hitboxRadius,
            definition: this.definition,
            direction: this.direction,
            full: {

            }
        };
    };
}
