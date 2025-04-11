import { Definitions, ObjectDefinition } from "../utils/definitions";

export type ProjectileDefinition = ObjectDefinition & {
    readonly despawnTime: number;
    readonly speed: number;
    readonly damage: number;
    readonly health: number;
    readonly hitboxRadius: number;
};

export const Projectile = new Definitions<ProjectileDefinition>([
    {
        idString: "dandelion",
        displayName: "Dandelion",
        despawnTime: 3,
        speed: 5,
        damage: 5,
        health: 5,
        hitboxRadius: 0.6
    },{
        idString: "missile",
        displayName: "Missile",
        despawnTime: 3,
        speed: 6,
        damage: 10,
        health: 10,
        hitboxRadius: 0.6
    },
] as ProjectileDefinition[]);
