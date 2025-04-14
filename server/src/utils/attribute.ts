import { ServerPetal } from "../entities/serverPetal";
import { MathGraphics } from "../../../common/src/utils/math";
import { Vec2 } from "../../../common/src/utils/vector";
import { AttributeName } from "../../../common/src/definitions/attribute";
import { AttributeParameters, Petals } from "../../../common/src/definitions/petal";
import { EventInitializer } from "./eventManager";
import { Effect } from "./effects";
import { EntityType } from "../../../common/src/constants";
import { ServerPlayer } from "../entities/serverPlayer";
import { ServerMob } from "../entities/serverMob";
import { ServerProjectile } from "../entities/serverProjectile";
import { Projectile } from "../../../common/src/definitions/projectile";
import { isDamageableEntity } from "../typings";

export enum AttributeEvents {
    HEALING = "HEALING",
    DEFEND = "DEFEND",
    ATTACK = "ATTACK",
    PETAL_DEAL_DAMAGE = "PETAL_DEAL_DAMAGE",
    FLOWER_DEAL_DAMAGE = "FLOWER_DEAL_DAMAGE",
    FLOWER_GET_DAMAGE = "FLOWER_GET_DAMAGE",
    PROJECTILE_DEAL_DAMAGE = "PROJECTILE_DEAL_DAMAGE"
}

export enum PetalUsingAnimations {
    ABSORB = "ABSORB",
    NORMAL = "NORMAL"
}

export interface AttributeRealize<T extends AttributeName = AttributeName> {
    readonly unstackable?: boolean;
    readonly callback: (
        on: EventInitializer, petal: ServerPetal, data: AttributeParameters[T]
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
                        entity.receivePoison(
                            petal.owner, data.damagePerSecond, data.duration
                        );
                    }
                }
            )
            on<AttributeEvents.PROJECTILE_DEAL_DAMAGE>(
                AttributeEvents.PROJECTILE_DEAL_DAMAGE,
                (entity) => {
                    if (entity && data) {
                        entity.receivePoison(
                            petal.owner, data.damagePerSecond, data.duration
                        );
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
                    if (!entity || !data) return
                    new Effect({
                        effectedTarget: entity,
                        source: petal.owner,
                        modifier: {
                            healing: data.healing,
                        },
                        duration: data.duration,
                        workingType: [EntityType.Player]
                    }).start();
                }
            )

            on<AttributeEvents.PROJECTILE_DEAL_DAMAGE>(
                AttributeEvents.PROJECTILE_DEAL_DAMAGE,
                (entity) => {
                    if (!entity || !data) return;
                    new Effect({
                        effectedTarget: entity,
                        source: petal.owner,
                        modifier: {
                            healing: data.healing,
                        },
                        duration: data.duration,
                        workingType: [EntityType.Player]
                    }).start();
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
                        entity.receivePoison(
                            petal.owner, data.damagePerSecond, data.duration
                        );
                    }
                }
            )
        }
    },

    damage_reflection: {
        unstackable: true,
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
    },

    shoot: {
        callback: (on, petal, data) => {
            on(AttributeEvents.ATTACK,() => {
                if (!data) return;
                const direction =
                    MathGraphics.directionBetweenPoints(petal.position, petal.owner.position);
                const position = petal.position;
                const projectile = new ServerProjectile(
                    petal.owner, position, direction, data, petal);
                projectile.addVelocity(Vec2.mul(direction, 6 * data.speed));
                if (data.definition.onGround)
                    projectile.addVelocity(Vec2.mul(direction, 80 * data.hitboxRadius / 5));
            }, PetalUsingAnimations.NORMAL)
        }
    },

    peas_shoot: {
        callback: (on, petal, data) => {
            on(AttributeEvents.ATTACK,() => {
                if (!data) return;
                const direction =
                    MathGraphics.directionBetweenPoints(petal.position, petal.petalBunch.centerPosition);
                const position = petal.position;
                const projectile = new ServerProjectile(
                    petal.owner, position, direction, data, petal);
                projectile.addVelocity(Vec2.mul(direction, 6 * data.speed))
            }, PetalUsingAnimations.NORMAL)
        }
    },

    critical_hit: {
        callback: (on, petal, data) => {
            on<AttributeEvents.PETAL_DEAL_DAMAGE>(
                AttributeEvents.PETAL_DEAL_DAMAGE,
                (entity) => {
                    if (!entity || !data) return
                    if (Math.random() < data.chance && isDamageableEntity(entity) && petal.damage) {
                        entity.receiveDamage(petal.damage * (data.multiplier - 1), petal.owner);
                    }
                }
            )
        }
    },
} as const;
