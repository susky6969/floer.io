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
};

export const Mobs = new Definitions<MobDefinition>([
    {
        idString: "ladybug",
        displayName: "Ladybug",
        damage: 20,
        health: 250,
        category: MobCategory.Passive,
        hitboxRadius: 5,
        speed: 7.8
    }
] satisfies MobDefinition[]);
