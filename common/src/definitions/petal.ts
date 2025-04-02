import { ObjectDefinition, Definitions } from "../utils/definitions";

export type PetalDefinition = ObjectDefinition & {
    readonly damage?: number
    readonly health?: number
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
        isDuplicate: true,
        pieceAmount: 5,
        isShowedInOne: false
    },
    {
        idString: "sand",
        displayName: "Sand",
        isDuplicate: true,
        pieceAmount: 4,
        isShowedInOne: true
    },
    {
        idString: "basic",
        displayName: "Basic",
        isDuplicate: false,
        pieceAmount: 1
    }
] satisfies PetalDefinition[]);
