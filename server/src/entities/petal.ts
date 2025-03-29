import { ServerEntity } from "./serverEntity";
import { type Vector, Vec2 } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";

export class Petal extends ServerEntity {
    type = EntityType.Petal;
    get position(): Vector { return this._position; }
    set position(pos: Vector) { this._position = pos; }

    direction: Vector = Vec2.new(0, 0);

    hitbox = new CircleHitbox(10);

    tick(): void{

    }

    get data(): Required<EntitiesNetData[EntityType]>{
        return {
            position: this.position,
            direction: this.direction,
            full: {

            }
        };
    };
}
