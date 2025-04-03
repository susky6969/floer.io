import { ServerEntity } from "./serverEntity";
import { type Vector } from "../../../common/src/utils/vector";
import { type EntitiesNetData } from "../../../common/src/packets/updatePacket";
import { CircleHitbox } from "../../../common/src/utils/hitbox";
import { EntityType } from "../../../common/src/constants";
import { PetalDefinition, Petals } from "../../../common/src/definitions/petal";

export class ServerPetal extends ServerEntity {
    type = EntityType.Petal;

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

    hitbox = new CircleHitbox(0.2);
    definition: PetalDefinition = Petals.fromString("light");

    tick(): void{

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
