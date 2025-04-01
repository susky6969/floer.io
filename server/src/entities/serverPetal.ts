import { ServerEntity } from "./serverEntity";
import { type Vector, Vec2 } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
import { PetalDefinition, Petals } from "../../../common/src/definitions/petal";

export class ServerPetal extends ServerEntity {
    type = EntityType.Petal;
    get position(): Vector { return this._position; }
    set position(pos: Vector) { this._position = pos; }

    hitbox = new CircleHitbox(10);
    definition: PetalDefinition = Petals.fromString("light");

    tick(): void{}

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            definition: this.definition,
            full: {

            }
        };
    };
}
