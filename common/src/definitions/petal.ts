import { ObjectDefinition, Definitions } from "../utils/definitions";

export enum PetalCopyType {
    One,
    Multiple
}

export enum PetalMultipleType {
    ShowInOne,
    All
}

export type PetalDefinition = ObjectDefinition & MultiplePetals;

export type MultiplePetals = {
    readonly multiple: PetalCopyType.One
} | {
    readonly multiple: PetalCopyType.Multiple
    readonly pieceNumber: number
    readonly multipleDisplay: PetalMultipleType
};

export const Petals = new Definitions<PetalDefinition>(([
    {
        idString: "light",
        displayName: "Light",
        multiple: PetalCopyType.Multiple,
        pieceNumber: 5,
        multipleDisplay: PetalMultipleType.All
    },
    {
        idString: "lighter",
        displayName: "Lighter",
        multiple: PetalCopyType.Multiple,
        pieceNumber: 4,
        multipleDisplay: PetalMultipleType.ShowInOne
    },
    {
        idString: "basic",
        displayName: "Basic",
        multiple: PetalCopyType.One
    }
] satisfies PetalDefinition[]));
