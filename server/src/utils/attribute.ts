import { ServerPetal } from "../entities/serverPetal";
import { MathGraphics } from "../../../common/src/utils/math";
import { Vec2 } from "../../../common/src/utils/vector";
import { PetalAttributeName } from "../../../common/src/definitions/attribute";
import { PetalAttributeData } from "../../../common/src/definitions/petal";
import { EventInitializer } from "./eventManager";

export enum PetalAttributeEvents {
    HEALING = "HEALING",
    DEFEND = "DEFEND"
}

export enum PetalUsingAnimations {
    ABSORB = "ABSORB",
    NORMAL = "NORMAL"
}

export interface PetalAttributeRealize {
    readonly callback: (
        on: EventInitializer, petal: ServerPetal, data: PetalAttributeData[PetalAttributeName]
    ) => void
}

export const PetalAttributeRealizes: {[K in PetalAttributeName]: PetalAttributeRealize} = {
    "absorbing_heal": {
        callback: (on, petal, data: PetalAttributeData["absorbing_heal"]) => {
            on(PetalAttributeEvents.HEALING, () => {
                if (data) petal.owner.health += data;
            }, PetalUsingAnimations.ABSORB);
        }
    },

    "boost": {
        callback: (on, petal, data: PetalAttributeData["boost"]) => {
            on(PetalAttributeEvents.DEFEND, () => {
                if (data) {
                    const direction =
                        MathGraphics.directionBetweenPoints(petal.owner.position, petal.position);
                    petal.owner.position = Vec2.add(
                        petal.owner.position,
                        Vec2.mul(direction, data)
                    )
                }
            }, PetalUsingAnimations.NORMAL);
        }
    }
} as const;
