import { ServerEntity, isDamageableEntity } from "./serverEntity";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { PetalDefinition, Petals } from "../../../common/src/definitions/petal";
import { Game } from "../game";
import { ServerPlayer } from "./serverPlayer";
import { GameOverPacket } from "../../../common/src/packets/gameOverPacket";

export class ServerPetal extends ServerEntity {
    type = EntityType.Petal;

    owner: ServerPlayer;

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

    constructor(player: ServerPlayer, definition: PetalDefinition) {
        super(player.game, player.position);
        this.hitbox = new CircleHitbox(definition.hitboxRadius);
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
        }else {
            const entities = this.game.grid.intersectsHitbox(this.hitbox);

            for (const entity of entities) {
                if (!isDamageableEntity(entity)) continue;
                const collision = this.hitbox.getIntersection(entity.hitbox);
                switch (entity.type) {
                    case EntityType.Player:
                        if (entity === this.owner) continue;

                        if (collision && this.definition.damage) {
                            entity.receiveDamage(this.definition.damage, this.owner);
                        }

                        break;
                    case EntityType.Petal:
                        if (entity === this) continue;
                        if (entity.owner === this.owner) continue;

                        if (collision && this.definition.damage) {
                            entity.receiveDamage(this.definition.damage);
                        }
                }
            }

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
                            this.isUsing = false;
                            this.useReload = 0;
                        }
                    }, timeDelay);
                }
            }
        }
    }

    receiveDamage(amount: number) {
        if (!this.health) return;
        if (this.isReloading) return;

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
