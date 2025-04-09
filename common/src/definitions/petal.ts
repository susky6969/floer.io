import { Definitions, ObjectDefinition } from "../utils/definitions";
import { AttributeName } from "./attribute";
import { Rarities } from "./rarity";
import { PlayerModifiers } from "../typings";

export type SavedPetalDefinitionData = PetalDefinition | null

export type PetalDefinition = ObjectDefinition & {
    readonly damage?: number
    readonly health?: number
    readonly reloadTime?: number
    readonly hitboxRadius: number
    readonly extendable: boolean
    readonly rarity: Rarities
    readonly attributes?: AttributeData
    readonly modifiers?: Partial<PlayerModifiers>
    readonly undroppable?: boolean
} & PetalPieceType & PetalUsageType;

type PetalPieceType = {
    readonly isDuplicate: false
    readonly pieceAmount: 1
    readonly displaySize: number
    readonly selfRotation: number
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

export type AttributeData = {
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
})

export function getDisplayedPieces(petal: PetalDefinition): number {
    if (petal.isDuplicate && petal.isShowedInOne) return 1;
    return petal.pieceAmount;
}

export const Petals = new Definitions<PetalDefinition>([
    {
        idString: "light",
        displayName: "Light",
        damage: 8,
        health: 5,
        extendable: true,
        reloadTime: 0.5,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: true,
        pieceAmount: 2,
        isShowedInOne: false,
        rarity: Rarities.unusual
    },
    {
        idString: "stinger",
        displayName: "Stinger",
        damage: 35,
        health: 8,
        extendable: true,
        reloadTime: 4,
        selfRotation: 0.1,
        usable: false,
        displaySize: 25,
        hitboxRadius: 0.3,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.unusual
    },
    {
        idString: "sand",
        displayName: "Sand",
        damage: 4,
        health: 5,
        reloadTime: 1.4,
        extendable: true,
        usable: false,
        hitboxRadius: 0.4,
        isDuplicate: true,
        pieceAmount: 4,
        isShowedInOne: true,
        rarity: Rarities.rare
    },
    {
        idString: "rose",
        displayName: "Rose",
        damage: 3,
        health: 3,
        extendable: false,
        selfRotation: 0,
        usable: true,
        useTime: 1.5,
        attributes: {
            absorbing_heal: 10
        },
        reloadTime: 3.5,
        hitboxRadius: 0.5,
        displaySize: 35,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.unusual
    },{
        idString: "tri_rose",
        displayName: "Rose",
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
        rarity: Rarities.rare,
        usingAssets: "rose"
    },
    {
        idString: "bubble",
        displayName: "Bubble",
        damage: 0,
        health: 1,
        extendable: false,
        selfRotation: 0,
        usable: true,
        useTime: 0,
        attributes: {
            boost: 10
        },
        reloadTime: 3.5,
        hitboxRadius: 0.6,
        displaySize: 45,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.rare
    },
    {
        idString: "unstoppable_bubble",
        displayName: "UNBubble",
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
        rarity: Rarities.super,
        usingAssets: "bubble"
    },
    {
        idString: "basic",
        displayName: "Basic",
        damage: 10,
        health: 10,
        extendable: true,
        selfRotation: 0,
        usable: false,
        reloadTime: 2.5,
        hitboxRadius: 0.5,
        displaySize: 45,
        isDuplicate: false,
        pieceAmount: 1,
        undroppable: true,
        rarity: Rarities.common
    },
    {
        idString: "dandelion",
        displayName: "Dandelion",
        damage: 5,
        health: 5,
        extendable: true,
        selfRotation: 0.02,
        usable: false,
        attributes: {
            healing_debuff: {
                healing: 0.8,
                duration: 10,
            }
        },
        reloadTime: 2,
        hitboxRadius: 0.5,
        displaySize: 45,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.rare,
    }, {
        idString: "iris",
        displayName: "Iris",
        damage: 5,
        health: 5,
        extendable: true,
        selfRotation: 0,
        usable: false,
        attributes: {
            poison: {
                damagePerSecond: 9,
                duration: 6.5
            }
        },
        reloadTime: 6,
        hitboxRadius: 0.4,
        displaySize: 25,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.unusual,
    }, {
        idString: "cactus",
        displayName: "Cactus",
        damage: 5,
        health: 15,
        extendable: true,
        selfRotation: 0,
        usable: false,
        modifiers: {
            maxHealth: 20
        },
        reloadTime: 1,
        hitboxRadius: 0.6,
        displaySize: 52,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.rare,
    }, {
        idString: "poison_cactus",
        displayName: "Cactus",
        damage: 5,
        health: 15,
        extendable: true,
        selfRotation: 0,
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
        displaySize: 52,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.epic,
    }, {
        idString: "tri_cactus",
        displayName: "Cactus",
        damage: 5,
        health: 15,
        extendable: true,
        usable: false,
        modifiers: {
            maxHealth: 20
        },
        reloadTime: 1,
        hitboxRadius: 0.6,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: Rarities.legendary,
        usingAssets: "cactus"
    },{
        idString: "salt",
        displayName: "Salt",
        damage: 10,
        health: 10,
        extendable: true,
        selfRotation: 0,
        usable: false,
        attributes:{
            damage_reflection: 0.25
        },
        reloadTime: 2.5,
        displaySize: 40,
        hitboxRadius: 0.6,
        isDuplicate: false,
        pieceAmount: 1,
        rarity: Rarities.rare
    },
    {
        idString: "tri_stinger",
        displayName: "Stinger",
        damage: 35,
        health: 8,
        extendable: true,
        reloadTime: 4,
        usable: false,
        hitboxRadius: 0.3,
        isDuplicate: true,
        isShowedInOne: true,
        pieceAmount: 3,
        rarity: Rarities.legendary,
        usingAssets: "stinger"
    }
] satisfies PetalDefinition[]);
