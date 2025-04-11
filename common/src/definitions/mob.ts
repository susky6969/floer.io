import { ObjectDefinition, Definitions } from "../utils/definitions";
import { Projectile, ProjectileDefinition } from "./projectile";

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
    readonly shoot: ProjectileDefinition;
    readonly shootSpeed: number
}

export const Mobs = new Definitions<MobDefinition>([
    {
        idString: "ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 2,
        speed: 3,
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
        speed: 3,
        usingAssets: "ladybug",
        lootTable: {
            "rose": 1,
            "tri_rose": 1,
            "triplet": 1,
            "epic_rose": 1,
            "bubble": 0.8,
            "leg_bubble": 0.06,
        }
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
            "tri_rose": 0.51,
            "bubble": 0.8,
            "leg_bubble": 0.06,
            "epic_rose": 0.51,
            "triplet": 0.02,
        }
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
            "tri_rose": 0.2,
            "epic_rose": 0.051,
            "bubble": 0.08,
            "leg_bubble": 0.006,
            "triplet": 0.012,
        }
    },{
        idString: "bee",
        displayName: "Bee",
        damage: 50,
        health: 15,
        category: MobCategory.Unactive,
        hitboxRadius: 1,
        speed: 3,
        lootTable: {
            "fast": 0.12,
            "stinger": 0.7,
            "twin": 0.03,
            "dual_stinger": 0.01,
            "bubble": 0.006,
            "leg_bubble": 0.0006
        }
    },{
        idString: "cactus",
        displayName: "Cactus",
        damage: 35,
        health: 42,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
        lootTable: {
            "stinger": 0.05,
            "dual_stinger": 0.01,
            "cactus": 0.03,
            "poison_cactus": 0.01,
            "tri_cactus": 0.0005
        }
    },{
        idString: "rock",
        displayName: "Rock",
        damage: 10,
        health: 16,
        category: MobCategory.Fixed,
        hitboxRadius: 2,
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
        speed: 3,
        lootTable: {
            "iris": 0.09,
            "salt": 0.06,
            "triplet": 0.003,
            "tri_stinger": 0.0006,
        }
    },{
        idString: "hornet",
        displayName: "Hornet",
        damage: 50,
        health: 35,
        category: MobCategory.Enemy,
        shootable: true,
        shoot: Projectile.fromString("missile"),
        shootSpeed: 2,
        aggroRadius: 30,
        hitboxRadius: 2,
        speed: 3,
        lootTable: {
            "dandelion": 0.14,
            "bubble": 0.05,
            "leg_bubble": 0.006,
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
        speed: 4,
        lootTable: {
            "iris": 0.24,
            "stinger": 0.18,
            "dual_stinger": 0.011,
            "triplet": 0.012,
            "tri_stinger": 0.006,
        }
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
            "twin": 0.24,
            "triplet": 0.0012,
        }
    },{
        idString: "worker_ant",
        displayName: "Worker Ant",
        damage: 10,
        health: 25,
        category: MobCategory.Passive,
        hitboxRadius: 1.5,
        speed: 3,
        lootTable: {
            "fast": 0.46,
            "leaf": 0.28,
            "twin": 0.13,
            "rice": 0.005,
            "tri_leaf": 0.0002,
            "triplet": 0.0006
        }
    },{
        idString: "baby_ant",
        displayName: "Baby Ant",
        damage: 10,
        health: 10,
        category: MobCategory.Unactive,
        hitboxRadius: 1.5,
        speed: 3,
        lootTable: {
            "fast": 0.44,
            "leaf": 0.26,
            "twin": 0.12,
            "rice": 0.005,
            "tri_leaf": 0.0002,
            "triplet": 0.0006
        }
    }
] satisfies MobDefinition[]);
