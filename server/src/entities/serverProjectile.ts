import { collideableEntity, damageableEntity, damageSource, ServerEntity } from "./serverEntity";
import { Vec2, Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
import { ProjectileDefinition } from "../../../common/src/definitions/projectile";
import { AttributeEvents } from "../utils/attribute";
import { ServerPetal } from "./serverPetal";

export class ServerProjectile extends ServerEntity<EntityType.Projectile> {
    type: EntityType.Projectile = EntityType.Projectile;

    hitbox: CircleHitbox;
    definition: ProjectileDefinition;

    health: number = 0;

    despawnTime: number = 0;
    direction: Vector = Vec2.new(0, 0);
    source: damageSource;
    elasticity = 0;

    from?: ServerPetal;

    canReceiveDamageFrom(source: damageableEntity): boolean {
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
                position: Vector, direction: Vector, definition: ProjectileDefinition, from?: ServerPetal) {
        super(source.game, position);

        this.hitbox = new CircleHitbox(definition.hitboxRadius);
        this.position = position;
        this.direction = direction;
        this.source = source;
        this.definition = definition;

        this.from = from;

        this.health = this.definition.health;

        this.game.grid.addEntity(this);
    }

    tick(): void{
        super.tick();

        this.despawnTime += this.game.dt;
        if (this.despawnTime >= this.definition.despawnTime) {
            this.destroy();
        }

        this.setAcceleration(Vec2.mul(this.direction, this.definition.speed));
    }

    dealDamageTo(to: damageableEntity): void{
        if (to.canReceiveDamageFrom(this)) {
            to.receiveDamage(this.definition.damage, this.source);
            if (this.from && this.source.type === EntityType.Player) {
                this.source.sendEvent(AttributeEvents.PROJECTILE_DEAL_DAMAGE, to, this.from)
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
            definition: this.definition,
            direction: this.direction,
            full: {

            }
        };
    };
}
