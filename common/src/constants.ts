import { Modifiers } from "./typings";

export enum EntityType {
    Player,
    Petal,
    Mob,
    Loot,
    Projectile
}

export const GameConstants = {
    maxPosition: 3036,
    player: {
        radius: 1.5,
        defaultBodyDamage: 20,
        defaultHealth: 125,
        maxSpeed: 3.5,
        defaultName: "Player",
        maxNameLength: 20,
        spawnMaxX: 100,
        spawnMaxY: 50,
        defaultSlot: 8,
        defaultPrepareSlot: 8,
        defaultEquippedPetals: ["basic","basic","basic","basic","basic","basic","basic","basic"],
        defaultPreparationPetals: [],
        defaultPetalDistance: 3.8,
        defaultPetalAttackingDistance: 6.5,
        defaultPetalDefendingDistance: 2.5,
        defaultModifiers: (): Modifiers => ({
            healing: 1,
            maxHealth: 150,
            healPerSecond: 0.1,
            speed: 1,
            revolutionSpeed: 2
        })
    },
    petal: {
        rotationRadius: 0.5
    },
    game: {
        width: 3036,
        height: 80
    },
    loot: {
        radius: 0.5,
        spawnRadius: 3,
        despawnTime: 50
    },
    mob: {
        maxHealth: 100000,
        walkingReload: 2,
        walkingTime: 1,
        defaultModifiers: (): Modifiers => ({
            healing: 1,
            maxHealth: 1,
            healPerSecond: 0,
            revolutionSpeed: 0,
            speed: 1
        })
    },
    maxTokenLength: 20
};

export const Zones:
{
    [key: string]: {
        x: number,
        width: number,
        displayColor: string,
        backgroundColor: string,
        borderColor: string,
        density: number,
        spawning: Record<string, number>
    }
} = {
    "Easy": {
        x: 0,
        width: 500,
        displayColor: "#1da25e",
        backgroundColor: "#29ca77",
        borderColor: "#1da25e",
        density: 0.7,
        spawning: {
            "ladybug": 10,
            "rock": 20,
            "boulder": 1,
            "massive_ladybug": 0.1,
            "bee": 10,
            "worker_ant": 10,
            "baby_ant": 5,
            "soldier_ant": 2,
        }
    },
    "Medium": {
        x: 500,
        width: 500,
        displayColor: "#92a728",
        backgroundColor: "#ecdcb8",
        borderColor: "#bfb295",
        density: 0.7,
        spawning: {
            "ladybug": 10,
            "shiny_ladybug": 0.1,
            "beetle": 5,
            "cactus": 35,
            "mega_cactus": 15,
            "mega_beetle": 0.1,
            "bee": 10,
            "worker_ant": 5,
            "baby_ant": 5,
            "soldier_ant": 5,
        }
    },
    "Hard": {
        x: 1000,
        width: 700,
        displayColor: "#923a28",
        backgroundColor: "#9a5951",
        borderColor: "#742d2d",
        density: 0.75,
        spawning: {
            "ladybug": 10,
            "dark_ladybug": 20,
            "massive_dark_ladybug": 1,
            "hornet": 5,
            "mega_hornet": 1,
            "spider": 10,
            "mega_spider": 1,
            "beetle": 10,
            "mega_beetle": 1,
            "rock": 5,
            "boulder": 20,
            "worker_ant": 7,
            "baby_ant": 7,
            "soldier_ant": 15,
        }
    },
    "?": {
        x: 1700,
        width: 500,
        displayColor: "#a4aaa6",
        backgroundColor: "#888484",
        borderColor: "#484646",
        density: 0.8,
        spawning: {
            "dark_ladybug": 20,
            "massive_dark_ladybug": 5,
            "hornet": 20,
            "mega_hornet": 3,
            "spider": 15,
            "mega_spider": 3,
            "beetle": 15,
            "mega_beetle": 3,
            "boulder": 20,
            "worker_ant": 7,
            "baby_ant": 7,
            "soldier_ant": 20,
        }
    },
    "Hornet Hell": {
        x: 2200,
        width: 3036 - 2200,
        displayColor: "#fff04a",
        backgroundColor: "#ded247",
        borderColor: "#b6ab44",
        density: 0.8,
        spawning: {
            "hornet": 100,
            "mega_hornet": 15,
            "beetle": 15,
            "mega_beetle": 5,
            "mega_spider": 5,
        }
    }
}
