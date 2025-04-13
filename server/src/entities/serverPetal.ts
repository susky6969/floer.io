import { ServerEntity } from "./serverEntity";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
import { AttributeParameters, PetalDefinition } from "../../../common/src/definitions/petal";
import { ServerPlayer } from "./serverPlayer";
import { ServerMob } from "./serverMob";
import { CollisionResponse } from "../../../common/src/utils/collision";
import { AttributeEvents, PetalUsingAnimations, } from "../utils/attribute";
import { damageableEntity, damageSource } from "../typings";

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
            this.isLoadingFirstTime = false;
            this.useReload = 0;
        }
        this.setDirty();
    }

    isUsing?: PetalUsingAnimations;
    reloadTime: number = 0;
    useReload: number = 0;

    isLoadingFirstTime: boolean = true;

    readonly damage?: number;
    health?: number;

    knockback: number = 0;
    weight = 0.02;

    get canUse(): boolean {
        if (this.definition.usable)
            return this.useReload >= this.definition.useTime;
        return false;
    }

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
            case EntityType.Projectile:
                return source.source != this.owner
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
        if (this.owner.overleveled) {
            this.isReloading = true;
            this.isLoadingFirstTime = true;
            return;
        }

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
            if (this.isUsing === PetalUsingAnimations.ABSORB) {
                this.position = this.owner.position;
            }
        } else {
            if (this.definition.usable) {
                this.useReload += this.game.dt;
            }
        }
    }

    startUsing(animation: PetalUsingAnimations, func?: Function): void{
        this.isUsing = animation;

        setTimeout(() => {
            if (!this.isReloading) {
                this.isReloading = true;
                if(func) func()
            }
            this.isUsing = undefined;
            this.useReload = 0;
        }, 100);
    }

    dealDamageTo(to: damageableEntity): void{
        if (this.damage && to.canReceiveDamageFrom(this)) {
            to.receiveDamage(this.damage, this.owner);
            this.owner.sendEvent(
                AttributeEvents.PETAL_DEAL_DAMAGE,
                to,
                this
            )
        }
    }

    receiveDamage(amount: number, source: damageSource) {
        if (!this.health) return;
        if (!this.isActive()) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.isReloading = true;
        }
    }

    collideWith(collision: CollisionResponse, entity: damageableEntity): void{}

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            definition: this.definition,
            isReloading: this.isReloading,
            ownerId: this.owner.id,
            full: {

            }
        };
    };
}
