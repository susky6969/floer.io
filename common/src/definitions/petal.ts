import { ObjectDefinition, Definitions } from "../utils/definitions";

export type PetalDefinition = ObjectDefinition & {
    readonly damage?: number
    readonly health?: number
    readonly reloadTime?: number
    readonly useTime?: number
    readonly heal?: number
    readonly hitboxRadius: number
} & PetalPieceType;

type PetalPieceType = {
    readonly isDuplicate: false
    readonly pieceAmount: 1
} | {
    readonly isDuplicate: true
    // Only allowed to use duplicateDisplay when have more than one
    readonly pieceAmount: number
    readonly isShowedInOne: boolean
};

export function getDisplayedPieces(petal: PetalDefinition): number {
    if (petal.isDuplicate && petal.isShowedInOne) return 1;
    return petal.pieceAmount;
}

export const Petals = new Definitions<PetalDefinition>([
    {
        idString: "light",
        displayName: "Light",
        damage: 1,
        health: 1,
        reloadTime: 0.5,
        hitboxRadius: 0.3,
        isDuplicate: true,
        pieceAmount: 5,
        isShowedInOne: false
    },
    {
        idString: "stinger",
        displayName: "Stinger",
        damage: 50,
        health: 1,
        reloadTime: 5,
        hitboxRadius: 0.3,
        isDuplicate: false,
        pieceAmount: 1
    },
    {
        idString: "sand",
        displayName: "Sand",
        damage: 6,
        health: 3,
        reloadTime: 0.8,
        hitboxRadius: 0.4,
        isDuplicate: true,
        pieceAmount: 4,
        isShowedInOne: true
    },
    {
        idString: "rose",
        displayName: "Rose",
        damage: 3,
        health: 3,
        heal: 10,
        reloadTime: 1.5,
        useTime: 1.5,
        hitboxRadius: 0.5,
        isDuplicate: false,
        pieceAmount: 1
    }
] satisfies PetalDefinition[]);
