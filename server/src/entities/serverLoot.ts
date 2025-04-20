import { ServerEntity } from "./serverEntity";
import { Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { PetalDefinition } from "../../../common/src/definitions/petal";
import { ServerPlayer } from "./serverPlayer";
import { Game } from "../game";
import { Rarity } from "../../../common/src/definitions/rarity";

export class ServerLoot extends ServerEntity<EntityType.Loot> {
    type: EntityType.Loot = EntityType.Loot;

    hitbox: CircleHitbox;
    definition: PetalDefinition;

    despawnTime: number = 0;

    constructor(game: Game, position: Vector, definition: PetalDefinition) {
        super(game, position);
        this.hitbox = new CircleHitbox(GameConstants.loot.radius);

        this.position = position;

        this.definition = definition;

        this.game.grid.addEntity(this);
    }

    tick(): void{
        this.despawnTime += this.game.dt;
        if (this.despawnTime >= GameConstants.loot.despawnTime) {
            this.destroy();
        }

        const collidedEntities =
            this.game.grid.intersectsHitbox(this.hitbox);

        for (const collidedEntity of collidedEntities) {
            if (collidedEntity === this) continue;
            if (!(collidedEntity instanceof ServerPlayer)) continue;
            if (!collidedEntity.hitbox.collidesWith(this.hitbox)) continue;

            if (collidedEntity.inventory.pickUp(this.definition)){
                this.destroy();
                const rarity = Rarity.fromString(this.definition.rarity);
                if (rarity.globalMessage) {
                    let content = `The ${rarity.displayName} ${this.definition.displayName} has been found`
                    if (this.game.activePlayers.size >= 20) {
                        content += `by ${collidedEntity.name}`
                    }
                    this.game.sendGlobalMessage({
                        content: content +"!",
                        color: parseInt(rarity.color.substring(1), 16)
                    })
                }
            }
        }
    }

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            definition: this.definition,
            full: {

            }
        };
    };
}
