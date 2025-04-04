import { ObjectDefinition, Definitions } from "../utils/definitions";

export type PetalDefinition = ObjectDefinition & {
    readonly damage?: number
    readonly health?: number
    readonly reload?: number
    readonly radius: number
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
        reload: 0.5,
        radius: 0.3,
        isDuplicate: true,
        pieceAmount: 5,
        isShowedInOne: false
    },
    {
        idString: "stinger",
        displayName: "Stinger",
        damage: 50,
        health: 1,
        reload: 5,
        radius: 0.3,
        isDuplicate: false,
        pieceAmount: 1
    },
    {
        idString: "sand",
        displayName: "Sand",
        damage: 6,
        health: 3,
        reload: 0.8,
        radius: 0.4,
        isDuplicate: true,
        pieceAmount: 4,
        isShowedInOne: true
    },
    {
        idString: "basic",
        displayName: "Basic",
        radius: 0.5,
        isDuplicate: false,
        pieceAmount: 1
    }
] satisfies PetalDefinition[]);
