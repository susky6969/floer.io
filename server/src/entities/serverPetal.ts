import { ServerEntity } from "./serverEntity";
import { Vec2, type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
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

    reloadTime: number = 0;

    readonly damage?: number;
    health?: number;

    constructor(player: ServerPlayer, definition: PetalDefinition) {
        super(player.game, player.position);
        this.hitbox = new CircleHitbox(definition.radius);
        this.definition = definition;
        this.owner = player;

        this.damage = definition.damage;
        this.health = definition.health;
    }

    join(): void {
        this.game.grid.addEntity(this);
    }

    tick(): void{
        if (this.isReloading) {
            if (!this.definition.reload || this.reloadTime >= this.definition.reload){
                this.isReloading = false;
            }
            this.reloadTime += this.game.dt;
        } else {
            const entities = this.game.grid.intersectsHitbox(this.hitbox);

            for (const entity of entities) {
                if (!(entity instanceof ServerPlayer)) continue;
                if (entity === this.owner) continue;

                const collision = this.hitbox.getIntersection(entity.hitbox);
                if (collision) {
                    if (this.definition.damage)
                        entity.receiveDamage(this.definition.damage, this.owner);
                    if (this.definition.health)
                        this.receiveDamage(entity.damage);
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
