import { PlayerModifiers } from "./typings";

export enum EntityType {
    Player,
    Petal,
    Mob,
    Loot

}

export const GameConstants = {
    maxPosition: 2048,
    player: {
        radius: 1.5,
        defaultBodyDamage: 20,
        defaultHealth: 150,
        maxSpeed: 8,
        defaultName: "Player",
        maxNameLength: 20,
        spawnMaxX: 100,
        spawnMaxY: 50,
        revolutionSpeed: 2,
        defaultSlot: 8,
        defaultEquippedPetals: ["basic","basic","basic","basic","basic","basic","basic","basic"],
        defaultPreparationPetals: ["","","","","","","",""],
        defaultPetalDistance: 3.8,
        defaultPetalAttackingDistance: 6.5,
        defaultPetalDefendingDistance: 2.5,
        defaultModifiers: (): PlayerModifiers => ({
            healing: 1,
            maxHealth: 150,
            healPerSecond: 0.1
        })
    },
    petal: {
        rotationRadius: 0.5
    },
    game: {
        width: 2048,
        height: 50,
        spawningMob: {
            "ladybug": 10,
            "shiny_ladybug": 0.1,
            "dark_ladybug": 10,
            "beetle": 10,
            "spider": 10,
            "rock": 20,
            "cactus": 25,
            "massive_ladybug": 1,
            "bee": 10,
            "worker_ant": 10,
            "baby_ant": 10,
            "soldier_ant": 10,
        }
    },
    loot: {
        radius: 0.5,
        spawnRadius: 3,
        despawnTime: 20
    },
    mob: {
        maxHealth: 100000,
        walkingReload: 2,
        walkingTime: 1
    },
    maxTokenLength: 20
};
