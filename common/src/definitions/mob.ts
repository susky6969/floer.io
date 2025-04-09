import { ObjectDefinition, Definitions } from "../utils/definitions";

export enum MobCategory{
    Fixed,
    Enemy,
    Passive
}


export type MobDefinition = ObjectDefinition & {
    readonly damage: number
    readonly health: number
    readonly hitboxRadius: number
    readonly category: MobCategory
    readonly speed: number
    readonly lootTable: Record<string, number>
};

export const Mobs = new Definitions<MobDefinition>([
    {
        idString: "ladybug",
        displayName: "Ladybug",
        damage: 10,
        health: 150,
        category: MobCategory.Passive,
        hitboxRadius: 3,
        speed: 7.8,
        lootTable: {
            "light": 600,
            "rose": 600,
            "tri_rose": 250,
            "stinger": 400,
            "iris": 100,
            "bubble": 70,
            "cactus": 70,
            "poison_cactus": 45,
            "tri_cactus": 10,
            "tri_stinger": 8,
            "dandelion": 100,
            "salt": 100
        }
    },
    {
        idString: "mega_ladybug",
        displayName: "Ladybug",
        damage: 20,
        health: 2000,
        category: MobCategory.Passive,
        hitboxRadius: 8,
        speed: 7.8,
        usingAssets: "ladybug",
        lootTable: {
            "tri_rose": 600,
            "iris": 600,
            "bubble": 600,
            "cactus": 650,
            "poison_cactus": 600,
            "tri_cactus": 300,
            "tri_stinger": 200,
            "dandelion": 600,
            "salt": 500
        }
    },
] satisfies MobDefinition[]);
