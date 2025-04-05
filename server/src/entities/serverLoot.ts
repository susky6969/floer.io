import { ServerEntity } from "./serverEntity";
import {  Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType, GameConstants } from "../../../common/src/constants";
import { PetalDefinition } from "../../../common/src/definitions/petal";
import { ServerPlayer } from "./serverPlayer";
import { Game } from "../game";

export class ServerLoot extends ServerEntity<EntityType.Loot> {
    type: EntityType.Loot = EntityType.Loot;

    hitbox: CircleHitbox;
    definition: PetalDefinition;

    constructor(game: Game, position: Vector, definition: PetalDefinition) {
        super(game, position);
        this.hitbox = new CircleHitbox(GameConstants.loot.radius);

        this.position = position;

        this.definition = definition;

        this.game.grid.addEntity(this);
    }

    tick(): void{
        const collidedEntities =
            this.game.grid.intersectsHitbox(this.hitbox);

        for (const collidedEntity of collidedEntities) {
            if (collidedEntity === this) continue;
            if (!(collidedEntity instanceof ServerPlayer)) continue;

            this.destroy()
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
