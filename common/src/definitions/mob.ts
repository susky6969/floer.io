import { Definitions, ObjectDefinition } from "../utils/definitions";
import { Projectile, ProjectileDefinition, ProjectileParameters } from "./projectile";
import { RarityName } from "./rarity";

export enum MobCategory{
    Fixed,
    Unactive,
    Enemy,
    Passive
}


export type MobDefinition = ObjectDefinition & {
    readonly damage: number
    readonly health: number
    readonly hitboxRadius: number
    readonly lootTable: Record<string, number>
    readonly rarity: RarityName;
    readonly exp: number
    readonly reachingAway?: boolean
} & MobCategoryType & MobShootType;

export type MobCategoryType =  {
    readonly category: MobCategory.Fixed
} | (({
    readonly category: MobCategory.Unactive | MobCategory.Passive
} | {
    readonly category: MobCategory.Enemy
    readonly aggroRadius: number
}) & {
    readonly speed: number
});

export type MobShootType = {
    readonly shootable?: false
} | {
    readonly shootable: true
    readonly shoot: ProjectileParameters;
    readonly shootSpeed: number
}

export const Mobs = new Definitions<MobDefinition>([
    {
        idString: "ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 1.5,
        speed: 3,
        lootTable: {
            "rose": 0.88,
            "leaf": 0.52,
            "twin": 0.24,
            "triplet": 0.0012
        },
        rarity: RarityName.common,
        exp: 1
    },
    {
        idString: "massive_ladybug",
        displayName: "Ladybug",
        damage: 20,
        health: 1000,
        category: MobCategory.Unactive,
        hitboxRadius: 5,
        speed: 3,
        usingAssets: "ladybug",
        lootTable: {
            "rose": 1,
            "tri_rose": 1,
            "triplet": 1,
            "epic_rose": 1,
            "bubble": 0.8,
            "leg_bubble": 0.06,
        },
        rarity: RarityName.legendary,
        exp: 10
    },{
        idString: "shiny_ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 150,
        category: MobCategory.Passive,
        hitboxRadius: 2,
        speed: 3,
        lootTable: {
            "rose": 1,
            "twin": 0.32,
            "tri_rose": 0.34,
            "bubble": 0.16,
            "wing": 0.16,
            "tri_wing": 0.004,
            "leg_bubble": 0.06,
            "epic_rose": 0.51,
            "triplet": 0.02,
        },
        rarity: RarityName.legendary,
        exp: 10
    },{
        idString: "dark_ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 25,
        category: MobCategory.Passive,
        hitboxRadius: 2,
        speed: 3,
        lootTable: {
            "rose": 1,
            "tri_rose": 0.72,
            "epic_rose": 0.051,
            "bubble": 0.16,
            "leg_bubble": 0.012,
            "triplet": 0.024
        },
        rarity: RarityName.epic,
        exp: 5
    },
    {
        idString: "massive_dark_ladybug",
        displayName: "Ladybug",
        damage: 20,
        health: 400,
        category: MobCategory.Passive,
        hitboxRadius: 3.5,
        speed: 3,
        usingAssets: "dark_ladybug",
        lootTable: {
            "tri_rose": 1,
            "epic_rose": 0.08,
            "bubble": 0.32,
            "leg_bubble": 0.03,
            "triplet": 0.08
        },
        rarity: RarityName.legendary,
        exp: 20
    },{
        idString: "bee",
        displayName: "Bee",
        damage: 50,
        health: 15,
        category: MobCategory.Unactive,
        hitboxRadius: 1,
        speed: 3,
        lootTable: {
            "fast": 0.24,
            "stinger": 0.14,
            "twin": 0.06,
            "dual_stinger": 0.02,
            "bubble": 0.012,
            "leg_bubble": 0.0012,
            "wing": 0.006,
            "tri_wing": 0.0012,
        },
        rarity: RarityName.common,
        exp: 2
    },{
        idString: "cactus",
        displayName: "Cactus",
        damage: 35,
        health: 42,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
        lootTable: {
            "dual_stinger": 0.02,
            "missile": 0.12,
            "big_missile": 0.01,
            "cactus": 0.06,
            "poison_cactus": 0.02,
            "tri_cactus": 0.001
        },
        rarity: RarityName.unusual,
        exp: 2
    },{
        idString: "mega_cactus",
        displayName: "Cactus",
        damage: 70,
        health: 100,
        category: MobCategory.Fixed,
        hitboxRadius: 6,
        lootTable: {
            "stinger": 0.5,
            "dual_stinger": 0.1,
            "missile": 0.66,
            "big_missile": 0.01,
            "cactus": 0.12,
            "poison_cactus": 0.04,
            "tri_cactus": 0.009
        },
        rarity: RarityName.legendary,
        usingAssets: "cactus",
        exp: 20
    },{
        idString: "rock",
        displayName: "Rock",
        damage: 10,
        health: 16,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
        lootTable: {
            "fast": 0.5,
            "twin": 0.24,
            "triplet": 0.02
        },
        rarity: RarityName.common,
        exp: 2
    }
    ,{
        idString: "boulder",
        displayName: "Boulder",
        damage: 20,
        health: 160,
        category: MobCategory.Fixed,
        hitboxRadius: 4,
        lootTable: {
            "fast": 0.2
        },
        rarity: RarityName.rare,
        exp: 20,
        usingAssets: "rock"
    },{
        idString: "beetle",
        displayName: "Beetle",
        damage: 40,
        health: 35,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 2,
        speed: 3,
        lootTable: {
            "iris": 0.18,
            "salt": 0.12,
            "triplet": 0.006,
            "tri_stinger": 0.0012,
            "wing": 0.006,
            "tri_wing": 0.0012,
        },
        rarity: RarityName.epic,
        exp: 5
    },{
        idString: "mega_beetle",
        displayName: "Beetle",
        damage: 30,
        health: 400,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 3,
        speed: 3,
        lootTable: {
            "iris": 1,
            "salt": 0.6,
            "wing": 0.31,
            "triplet": 0.02,
            "tri_stinger": 0.0006,
        },
        rarity: RarityName.legendary,
        exp: 50,
        usingAssets: "beetle"
    },{
        idString: "hornet",
        displayName: "Hornet",
        damage: 50,
        health: 35,
        category: MobCategory.Enemy,
        reachingAway: true,
        shootable: true,
        shoot: {
            hitboxRadius: 0.6,
            damage: 10,
            health: 10,
            despawnTime: 3,
            speed: 6,
            definition: Projectile.fromString("missile")
        },
        shootSpeed: 2,
        aggroRadius: 30,
        hitboxRadius: 2,
        speed: 3,
        lootTable: {
            "dandelion": 0.28,
            "bubble": 0.1,
            "missile": 0.09,
            "big_missile": 0.01,
            "leg_bubble": 0.006,
            "wing": 0.03,
            "tri_wing": 0.009,
        },
        rarity: RarityName.epic,
        exp: 10
    },{
        idString: "mega_hornet",
        displayName: "Hornet",
        damage: 35,
        health: 60,
        category: MobCategory.Enemy,
        reachingAway: true,
        shootable: true,
        shoot: {
            hitboxRadius: 1.2,
            damage: 20,
            health: 20,
            despawnTime: 3,
            speed: 6,
            definition: Projectile.fromString("missile")
        },
        shootSpeed: 2,
        aggroRadius: 30,
        hitboxRadius: 2 / 0.6,
        speed: 3,
        lootTable: {
            "dandelion": 0.14,
            "bubble": 0.05,
            "epic_bubble": 0.006,
            "triplet": 0.012,
            "tri_stinger": 0.006,
        },
        rarity: RarityName.super,
        exp: 10,
        usingAssets: "hornet"
    },{
        idString: "spider",
        displayName: "Spider",
        damage: 20,
        health: 25,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 2,
        speed: 4,
        lootTable: {
            "iris": 0.24,
            "stinger": 0.36,
            "dual_stinger": 0.024,
            "tri_stinger": 0.012,
            "web": 0.18,
            "tri_web": 0.004,
            "faster": 0.4,
            "dual_faster": 0.01,
        },
        rarity: RarityName.rare,
        exp: 5
    },{
        idString: "mega_spider",
        displayName: "Spider",
        damage: 20,
        health: 250,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 3.5,
        shootable: true,
        shoot: {
            hitboxRadius: 4,
            damage: 0,
            health: 10,
            despawnTime: 5,
            speed: 0,
            definition: Projectile.fromString("web"),
            modifiers: {
                speed: 0.5
            }
        },
        shootSpeed: 0.7,
        speed: 3,
        lootTable: {
            "iris": 0.48,
            "stinger": 0.72,
            "dual_stinger": 0.08,
            "tri_stinger": 0.02,
            "web": 0.36,
            "tri_web": 0.01,
            "faster": 0.6,
            "dual_faster": 0.02,
        },
        rarity: RarityName.legendary,
        exp: 5,
        usingAssets: "spider"
    },{
        idString: "soldier_ant",
        displayName: "Soldier Ant",
        damage: 10,
        health: 40,
        category: MobCategory.Enemy,
        aggroRadius: 10,
        hitboxRadius: 1.5,
        speed: 3,
        lootTable: {
            "fast": 0.44,
            "iris": 0.12,
            "twin": 0.8,
            "wing": 0.016,
            "tri_wing": 0.0012,
            "triplet": 0.0012,
            "faster": 0.4,
            "dual_faster": 0.01,
        },
        rarity: RarityName.unusual,
        exp: 4
    },{
        idString: "worker_ant",
        displayName: "Worker Ant",
        damage: 10,
        health: 25,
        category: MobCategory.Passive,
        hitboxRadius: 1.5,
        speed: 3,
        lootTable: {
            "fast": 0.92,
            "leaf": 0.56,
            "twin": 0.24,
            "rice": 0.01,
            "tri_leaf": 0.004,
            "triplet": 0.0012
        },
        rarity: RarityName.unusual,
        exp: 4
    },{
        idString: "baby_ant",
        displayName: "Baby Ant",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 1,
        speed: 3,
        lootTable: {
            "fast": 0.88,
            "leaf": 0.52,
            "twin": 0.24,
            "rice": 0.01,
            "tri_leaf": 0.0004,
            "triplet": 0.0012
        },
        rarity: RarityName.unusual,
        exp: 4
    }
] satisfies MobDefinition[]);
