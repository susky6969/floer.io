import { Definitions, ObjectDefinition } from "../utils/definitions";
import { AttributeName } from "./attribute";
import { RarityName } from "./rarity";
import { PlayerModifiers } from "../typings";
import { Projectile, ProjectileDefinition } from "./projectile";

export type SavedPetalDefinitionData = PetalDefinition | null

export type PetalDefinition = ObjectDefinition & {
    readonly description?: string
    readonly damage?: number
    readonly health?: number
    readonly reloadTime?: number
    readonly hitboxRadius: number
    readonly extendable: boolean
    readonly rarity: RarityName
    readonly attributes?: AttributeParameters
    readonly modifiers?: Partial<PlayerModifiers>
    readonly undroppable?: boolean
    readonly images?: {
        readonly slotDisplaySize?: number
        readonly slotRotation?: number
        readonly slotRevolution?: number
        readonly selfGameRotation?: number
        readonly centerXOffset?: number
        readonly centerYOffset?: number
        readonly facingOut?: boolean
    }
} & PetalPieceType & PetalUsageType;

type PetalPieceType = {
    readonly isDuplicate: false
    readonly pieceAmount: 1
} | {
    readonly isDuplicate: true
    // Only allowed to use duplicateDisplay when have more than one
    readonly pieceAmount: number
    readonly isShowedInOne: boolean
};

type PetalUsageType = {
    readonly usable: false
} | {
    readonly usable: true
    readonly useTime: number
}

export type AttributeParameters = {
    [K in AttributeName] ?: unknown
} & ({
    absorbing_heal?: number
    boost?: number,
    poison?: {
        damagePerSecond: number
        duration: number
    }
    healing_debuff?: {
        healing: number
        duration: number
    }
    body_poison?: {
        damagePerSecond: number
        duration: number
    }
    damage_reflection?: number
    shoot?: ProjectileDefinition
})

export function getDisplayedPieces(petal: PetalDefinition): number {
    if (petal.isDuplicate && petal.isShowedInOne) return 1;
    return petal.pieceAmount;
}

export const Petals = new Definitions<PetalDefinition>([
    {
        idString: "fast",
        displayName: "Fast",
        description: "Weaker than most petals, but recharges very quickly",
        damage: 8,
        health: 5,
        extendable: true,
        reloadTime: 0.5,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.common,
        usingAssets: "light"
    },
    {
        idString: "twin",
        displayName: "Twin",
        description: "Why stop at one? Why not TWO?!",
        damage: 8,
        health: 5,
        extendable: true,
        reloadTime: 0.5,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: true,
        pieceAmount: 2,
        isShowedInOne: false,
        rarity: RarityName.unusual,
        usingAssets: "light"
    },
    {
        idString: "triplet",
        displayName: "Triplet",
        description: "How about THREE?!",
        damage: 8,
        health: 5,
        extendable: true,
        reloadTime: 0.5,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: true,
        pieceAmount: 3,
        isShowedInOne: false,
        rarity: RarityName.epic,
        usingAssets: "light"
    },
    {
        idString: "leaf",
        displayName: "Leaf",
        description: "Gathers energy from the sun to heal your flower passively",
        damage: 8,
        health: 10,
        extendable: true,
        images: {
            slotDisplaySize: 52,
            slotRotation: -0.1
        },
        modifiers: {
            healPerSecond: 1
        },
        reloadTime: 1,
        usable: false,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.unusual,
    },{
        idString: "tri_leaf",
        displayName: "Leaf",
        description: "Gathers energy from the sun to heal your flower passively",
        damage: 8,
        health: 10,
        extendable: true,
        images: {
            slotDisplaySize: 40,
            slotRotation: -0.1
        },
        modifiers: {
            healPerSecond: 0.7
        },
        reloadTime: 1,
        usable: false,
        hitboxRadius: 0.6,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: RarityName.legendary,
        usingAssets: "leaf"
    },
    {
        idString: "stinger",
        displayName: "Stinger",
        description: "It really hurts, but it's very fragile",
        damage: 35,
        health: 8,
        extendable: true,
        reloadTime: 4,
        images: {
            selfGameRotation: 0.1,
            slotDisplaySize: 25,
        },
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.unusual
    },
    {
        idString: "sand",
        displayName: "Sand",
        description: "A bunch of sand particles",
        damage: 4,
        health: 5,
        reloadTime: 1.4,
        extendable: true,
        usable: false,
        hitboxRadius: 0.4,
        isDuplicate: true,
        pieceAmount: 4,
        isShowedInOne: true,
        rarity: RarityName.rare
    },
    {
        idString: "rose",
        displayName: "Rose",
        description: "Its healing properties are amazing. Not so good at combat though",
        damage: 3,
        health: 3,
        extendable: false,
        usable: true,
        useTime: 1.5,
        images: {
            slotDisplaySize: 35,
        },
        attributes: {
            absorbing_heal: 10
        },
        reloadTime: 3.5,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.unusual
    },{
        idString: "tri_rose",
        displayName: "Rose",
        description: "Its healing properties are amazing. Not so good at combat though",
        damage: 5,
        health: 5,
        extendable: false,
        usable: true,
        useTime: 1,
        attributes: {
            absorbing_heal: 10.5
        },
        reloadTime: 3.5,
        hitboxRadius: 0.4,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: RarityName.rare,
        usingAssets: "rose"
    },{
        idString: "epic_rose",
        displayName: "Rose",
        description: "健胃消食片？",
        damage: 5,
        health: 5,
        extendable: false,
        usable: true,
        useTime: 1,
        images: {
            slotDisplaySize: 40
        },
        attributes: {
            absorbing_heal: 22
        },
        reloadTime: 3.5,
        hitboxRadius: 0.4,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.epic,
        usingAssets: "rose"
    },{
        idString: "dual_stinger",
        displayName: "Stinger",
        description: "It really hurts, but it's very fragile",
        damage: 35,
        health: 8,
        extendable: true,
        usable: false,
        reloadTime: 6,
        hitboxRadius: 0.3,
        isDuplicate: true,
        isShowedInOne: false,
        pieceAmount: 2,
        rarity: RarityName.rare,
        usingAssets: "stinger"
    },
    {
        idString: "bubble",
        displayName: "Bubble",
        description: "Physics are for the weak",
        damage: 0,
        health: 1,
        extendable: false,
        usable: true,
        useTime: 0,
        images: {
            slotDisplaySize: 45,
        },
        attributes: {
            boost: 10
        },
        reloadTime: 3.5,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.rare
    },
    {
        idString: "unstoppable_bubble",
        displayName: "UNBubble",
        description: "Physics are for the weak",
        damage: 0,
        health: 1,
        extendable: false,
        usable: true,
        useTime: 0,
        attributes: {
            boost: 10
        },
        reloadTime: 0,
        hitboxRadius: 0.6,
        isShowedInOne: false,
        isDuplicate: true,
        pieceAmount: 2,
        rarity: RarityName.super,
        usingAssets: "bubble"
    },
    {
        idString: "basic",
        displayName: "Basic",
        description: "A nice petal, not too strong but not too weak",
        damage: 10,
        health: 10,
        extendable: true,
        usable: false,
        images: {
            slotDisplaySize: 45,
        },
        reloadTime: 2.5,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1,
        undroppable: true,
        rarity: RarityName.common
    },
    {
        idString: "dandelion",
        displayName: "Dandelion",
        description: "It's interesting properties prevent healing effects on affected units",
        damage: 5,
        health: 5,
        extendable: true,
        images: {
            selfGameRotation: 0.02,
            slotDisplaySize: 45,
            slotRotation: 0.8,
            centerXOffset: -1,
            centerYOffset: -1,
            facingOut: true
        },
        usable: true,
        attributes: {
            healing_debuff: {
                healing: 0,
                duration: 10,
            },
            shoot: Projectile.fromString("dandelion")
        },
        useTime: 0.2,
        reloadTime: 2,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.rare,
    }, {
        idString: "iris",
        displayName: "Iris",
        description: "Very poisonous, but takes a little while to do its work",
        damage: 5,
        health: 5,
        extendable: true,
        usable: false,
        attributes: {
            poison: {
                damagePerSecond: 9,
                duration: 6.5
            }
        },
        reloadTime: 6,
        hitboxRadius: 0.4,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.unusual,
    }, {
        idString: "cactus",
        displayName: "Cactus",
        description: "Not very strong, but somehow increases your maximum health",
        damage: 5,
        health: 15,
        extendable: true,
        usable: false,
        images: {
            slotDisplaySize: 52,
        },
        modifiers: {
            maxHealth: 20
        },
        reloadTime: 1,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.rare,
    }, {
        idString: "poison_cactus",
        displayName: "Cactus",
        description: "Increases your maximum health and makes your flower toxic. Enemies hit by your flower will get poisoned",
        damage: 5,
        health: 15,
        extendable: true,
        images: {
            slotDisplaySize: 52,
        },
        usable: false,
        attributes: {
            poison: {
                damagePerSecond: 10,
                duration: 0.6
            },
            body_poison: {
                damagePerSecond: 9,
                duration: 4.5
            }
        },
        modifiers: {
            maxHealth: 20
        },
        reloadTime: 1,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.epic,
    }, {
        idString: "tri_cactus",
        displayName: "Cactus",
        description: "Not very strong, but somehow increases your maximum health",
        damage: 5,
        health: 15,
        extendable: true,
        usable: false,
        images: {
            slotDisplaySize: 52
        },
        modifiers: {
            maxHealth: 20
        },
        reloadTime: 1,
        hitboxRadius: 0.6,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: RarityName.legendary,
        usingAssets: "cactus"
    },{
        idString: "salt",
        displayName: "Salt",
        description: "Reflects some of the damage you take back to the enemy that dealt it",
        damage: 10,
        health: 10,
        extendable: true,
        images: {
            slotDisplaySize: 40,
        },
        usable: false,
        attributes:{
            damage_reflection: 0.25
        },
        reloadTime: 2.5,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.rare
    },
    {
        idString: "tri_stinger",
        displayName: "Stinger",
        description: "It really hurts, but it's very fragile",
        damage: 35,
        health: 8,
        extendable: true,
        reloadTime: 4,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: RarityName.legendary,
        usingAssets: "stinger"
    },
    {
        idString: "rice",
        displayName: "Rice",
        description: "Spawns instantly, but not very strong",
        damage: 9,
        health: 1,
        extendable: true,
        reloadTime: 0.04,
        images:{
            slotDisplaySize: 45
        },
        usable: false,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.epic
    },
    {
        idString: "leg_bubble",
        displayName: "Bubble",
        description: "Physics are for the weak",
        damage: 0,
        health: 1,
        extendable: false,
        usable: true,
        useTime: 0,
        images: {
            slotDisplaySize: 45,
        },
        attributes: {
            boost: 4
        },
        reloadTime: 2,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: RarityName.epic,
        usingAssets: "bubble"
    }
] satisfies PetalDefinition[]);
