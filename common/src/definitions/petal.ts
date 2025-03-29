import { ObjectDefinition, Definitions } from "../utils/definitions";

export type PetalDefinition = ObjectDefinition & {
    damage?: number
    health?: number
} & PetalPieceType;

type PetalPieceType = {
    isDuplicate: false
    pieceAmount: 1
} | {
    isDuplicate: true
    // Only allowed to use duplicateDisplay when have more than one
    pieceAmount: number
    isShowedInOne: boolean
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
        idString: "lighter",
        displayName: "Lighter",
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
