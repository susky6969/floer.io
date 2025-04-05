import { damageableEntity, ServerEntity } from "./serverEntity";
import { Vec2 } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { PetalDefinition } from "../../../common/src/definitions/petal";
import { ServerPlayer } from "./serverPlayer";
import { ServerMob } from "./serverMob";

export class ServerPetal extends ServerEntity<EntityType.Petal> {
    type: EntityType.Petal = EntityType.Petal;

    owner: ServerPlayer;

    hitbox: CircleHitbox;
    definition: PetalDefinition;

    _isReloading: boolean = false;

    get isReloading(): boolean {
        return this._isReloading;
    }

    set isReloading(isReloading: boolean) {
        if (this._isReloading === isReloading) return;
        this._isReloading = isReloading;
        if (isReloading) {
            this.reloadTime = 0;
        } else {
            this.health = this.definition.health;
        }
        this.setDirty();
    }

    isUsing: boolean = false;

    reloadTime: number = 0;
    useReload: number = 0;

    get canUse(): boolean {
        return !this.definition.useTime
            || this.useReload >= GameConstants.petal.useReload;
    }

    readonly damage?: number;
    health?: number;

    canReceiveDamageFrom(source: damageableEntity): boolean {
        if (!this.health) return false;
        switch (source.type) {
            case EntityType.Player:
                return source != this.owner
            case EntityType.Mob:
                return true
            case EntityType.Petal:
                return source != this
                    && source.owner != this.owner
        }
    }

    isActive(): boolean {
        return !this.isReloading && !this.isUsing && !this.destroyed;
    }

    constructor(player: ServerPlayer, definition: PetalDefinition) {
        super(player.game, player.position);
        this.hitbox = new CircleHitbox(definition.hitboxRadius);

        this.position = player.position;
        this.definition = definition;
        this.owner = player;

        this.damage = definition.damage;
        this.health = definition.health;
    }

    join(): void {
        this.game.grid.addEntity(this);
        this.isReloading = true;
    }

    tick(): void{
        if (this.isReloading) {
            if (
                !this.definition.reloadTime
                || this.reloadTime >= this.definition.reloadTime
            ){
                this.isReloading = false;
            }
            this.reloadTime += this.game.dt;
            this.position = this.owner.position;
        } else if (this.isUsing) {
            this.position = Vec2.add(
                this.position,
                Vec2.div(
                    Vec2.sub(this.owner.position, this.position), 4
                )
            );
        } else {
            if (this.definition.useTime) {
                this.useReload += this.game.dt;
            }

            if (this.definition.heal && this.canUse) {
                const canHealOwner = this.owner.health < GameConstants.player.maxHealth
                    && new CircleHitbox(10, this.position).getIntersection(this.owner.hitbox);

                if (canHealOwner) {
                    this.isUsing = true;
                    const timeDelay = this.definition.useTime
                        ? this.definition.useTime * 1000
                        : 0;
                    setTimeout(() => {
                        if (this.definition.heal && !this.isReloading) {
                            this.owner.health += this.definition.heal;
                            this.isReloading = true;
                        }
                        this.isUsing = false;
                        this.useReload = 0;
                    }, timeDelay);
                }
            }
        }
    }

    dealDamageTo(entity: damageableEntity): void{
        if (this.damage && entity.canReceiveDamageFrom(this)) {
            entity.receiveDamage(this.damage, this.owner);
        }
    }

    receiveDamage(amount: number, source: ServerPlayer | ServerMob) {
        if (!this.health) return;
        if (!this.isActive()) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.isReloading = true;
        }
    }

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            definition: this.definition,
            isReloading: this.isReloading,
            full: {

            }
        };
    };
}
