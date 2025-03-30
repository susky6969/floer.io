import { ServerEntity } from "./serverEntity";
import { type Vector, Vec2 } from "@common/utils/vector";
import { type EntitiesNetData } from "@common/packets/updatePacket";
import { CircleHitbox } from "@common/utils/hitbox";
import { EntityType } from "@common/constants";

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
