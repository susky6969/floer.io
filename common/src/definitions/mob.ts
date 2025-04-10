import { ObjectDefinition, Definitions } from "../utils/definitions";

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
    readonly speed: number
    readonly lootTable: Record<string, number>
} & MobCategoryType;

export type MobCategoryType = {
    readonly category: MobCategory.Unactive | MobCategory.Passive | MobCategory.Fixed
} | {
    readonly category: MobCategory.Enemy
    readonly aggroRadius: number
}

export const Mobs = new Definitions<MobDefinition>([
    {
        idString: "ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "rose": 0.88,
            "leaf": 0.52,
            "twin": 0.24,
            "triplet": 0.0012
        }
    },
    {
        idString: "massive_ladybug",
        displayName: "Ladybug",
        damage: 20,
        health: 200,
        category: MobCategory.Passive,
        hitboxRadius: 5,
        speed: 7.8,
        usingAssets: "ladybug",
        lootTable: {
            "rose": 1,
            "tri_rose": 1,
            "triplet": 1,
            "epic_rose": 1
        }
    },{
        idString: "shiny_ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 150,
        category: MobCategory.Passive,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "rose": 1,
            "tri_rose": 0.51,
            "epic_rose": 0.51
        }
    },{
        idString: "dark_ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 25,
        category: MobCategory.Passive,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "rose": 1,
            "tri_rose": 0.2,
            "epic_rose": 0.051,
            "triplet": 0.012,
        }
    },{
        idString: "bee",
        displayName: "Bee",
        damage: 50,
        health: 15,
        category: MobCategory.Unactive,
        hitboxRadius: 1,
        speed: 7.8,
        lootTable: {
            "fast": 0.24,
            "stinger": 0.7,
            "twin": 0.03,
            "dual_stinger": 0.06,
            "bubble": 0.006,
            "tri_leaf": 0.0012,
            "triplet": 0.0012
        }
    },{
        idString: "cactus",
        displayName: "Cactus",
        damage: 35,
        health: 42,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "stinger": 0.5,
            "dual_stinger": 0.03,
            "cactus": 0.03,
            "poison_cactus": 0.02,
            "tri_cactus": 0.005
        }
    },{
        idString: "rock",
        displayName: "Rock",
        damage: 10,
        health: 150,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "fast": 0.2
        }
    },{
        idString: "beetle",
        displayName: "Beetle",
        damage: 40,
        health: 35,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 2,
        speed: 7.8,
        lootTable: {
            "iris": 0.24,
            "triplet": 0.012,
            "tri_stinger": 0.006,
        }
    },{
        idString: "spider",
        displayName: "Spider",
        damage: 20,
        health: 25,
        category: MobCategory.Enemy,
        aggroRadius: 20,
        hitboxRadius: 2,
        speed: 9,
        lootTable: {
            "iris": 0.24,
            "stinger": 0.55,
            "dual_stinger": 0.11,
            "triplet": 0.012,
            "tri_stinger": 0.006,
        }
    },{
        idString: "soldier_ant",
        displayName: "Soldier Ant",
        damage: 10,
        health: 150,
        category: MobCategory.Enemy,
        aggroRadius: 10,
        hitboxRadius: 1.5,
        speed: 7.8,
        lootTable: {
            "fast": 0.88,
            "iris": 0.24,
            "twin": 0.24,
            "triplet": 0.0012
        }
    },{
        idString: "worker_ant",
        displayName: "Worker Ant",
        damage: 10,
        health: 150,
        category: MobCategory.Passive,
        hitboxRadius: 1.5,
        speed: 7.8,
        lootTable: {
            "fast": 0.88,
            "leaf": 0.52,
            "twin": 0.24,
            "triplet": 0.0012
        }
    },{
        idString: "baby_ant",
        displayName: "Baby Ant",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 1.5,
        speed: 7.8,
        lootTable: {
            "fast": 0.88,
            "leaf": 0.52,
            "twin": 0.24,
            "tri_leaf": 0.0012,
            "triplet": 0.0012
        }
    }
] satisfies MobDefinition[]);
