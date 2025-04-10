import { ServerPetal } from "../entities/serverPetal";
import { MathGraphics } from "../../../common/src/utils/math";
import { Vec2 } from "../../../common/src/utils/vector";
import { AttributeName } from "../../../common/src/definitions/attribute";
import { AttributeData } from "../../../common/src/definitions/petal";
import { EventInitializer } from "./eventManager";
import { Effect } from "./effects";
import { EntityType } from "../../../common/src/constants";
import { ServerPlayer } from "../entities/serverPlayer";
import { ServerMob } from "../entities/serverMob";

export enum AttributeEvents {
    HEALING = "HEALING",
    DEFEND = "DEFEND",
    PETAL_DEAL_DAMAGE = "PETAL_DEAL_DAMAGE",
    FLOWER_DEAL_DAMAGE = "FLOWER_DEAL_DAMAGE",
    FLOWER_GET_DAMAGE = "FLOWER_GET_DAMAGE"
}

export enum PetalUsingAnimations {
    ABSORB = "ABSORB",
    NORMAL = "NORMAL"
}

export interface AttributeRealize<T extends AttributeName = AttributeName> {
    readonly unstackable?: boolean;
    readonly callback: (
        on: EventInitializer, petal: ServerPetal, data: AttributeData[T]
    ) => void
}

export const PetalAttributeRealizes: {[K in AttributeName]: AttributeRealize<K>} = {
    absorbing_heal: {
        callback: (on, petal, data) => {
            on(AttributeEvents.HEALING,
                () => {
                    if (data) petal.owner.heal(data)
                }
            , PetalUsingAnimations.ABSORB);
        }
    },

    boost: {
        callback: (on, petal, data) => {
            on(AttributeEvents.DEFEND,
                () => {
                    if (data) {
                        const direction =
                            MathGraphics.directionBetweenPoints(petal.owner.position, petal.position);
                        petal.owner.addVelocity(
                            Vec2.mul(direction, data * 10)
                        )
                    }
                }
            , PetalUsingAnimations.NORMAL);
        }
    },

    poison: {
        callback: (on, petal, data) => {
            on<AttributeEvents.PETAL_DEAL_DAMAGE>(
                AttributeEvents.PETAL_DEAL_DAMAGE,
                (entity) => {
                    if (entity && data) {
                        new Effect({
                            effectedTarget: entity,
                            func: (dt, effected) => {
                                if (!data) return;
                                if (effected instanceof ServerPlayer || effected instanceof ServerMob){
                                    if (!effected.canReceiveDamageFrom(petal)) return
                                    effected.receiveDamage(dt * data.damagePerSecond, petal.owner);
                                }
                            },
                            duration: data.duration,
                            workingType: [EntityType.Player, EntityType.Mob]
                        }).start();
                    }
                }
            )
        }
    },

    healing_debuff: {
        callback: (on, petal, data) => {
            on<AttributeEvents.PETAL_DEAL_DAMAGE>(
                AttributeEvents.PETAL_DEAL_DAMAGE,
                (entity) => {
                    if (entity && data) {
                        new Effect({
                            effectedTarget: entity,
                            modifier: {
                                healing: data.healing,
                            },
                            duration: data.duration,
                            workingType: [EntityType.Player]
                        }).start();
                    }
                }
            )
        }
    },

    body_poison: {
        callback: (on, petal, data) => {
            on<AttributeEvents.FLOWER_DEAL_DAMAGE>(
                AttributeEvents.FLOWER_DEAL_DAMAGE,
                (entity) => {
                    if (entity && data) {
                        new Effect({
                            effectedTarget: entity,
                            func: (dt, effected) => {
                                if (!data) return;
                                if (
                                    effected instanceof ServerPlayer
                                    || effected instanceof ServerMob
                                ){
                                    if (!effected.canReceiveDamageFrom(petal)) return
                                    effected.receiveDamage(dt * data.damagePerSecond, petal.owner);
                                }
                            },
                            duration: data.duration,
                            workingType: [EntityType.Player, EntityType.Mob]
                        }).start();
                    }
                }
            )
        }
    },

    damage_reflection: {
        callback: (on, petal, data) => {
            on<AttributeEvents.FLOWER_GET_DAMAGE>(AttributeEvents.FLOWER_GET_DAMAGE,
                (arg) => {
                    if (arg && data) {
                        const { entity, damage } = arg;
                        if (
                            entity instanceof ServerPlayer
                            || entity instanceof ServerMob
                            && entity.canReceiveDamageFrom(petal.owner)
                        ) {
                            entity.receiveDamage(data * damage, petal.owner, true)
                        }
                    }
                }
            )
        }
    }
} as const;
