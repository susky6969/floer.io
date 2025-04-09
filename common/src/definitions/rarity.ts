import { Definitions, ObjectDefinition } from "../utils/definitions";

export enum Rarities {
    common = "common",
    unusual = "unusual",
    rare = "rare",
    epic = "epic",
    legendary = "legendary",
    super = "super"
}

type RarityDefinition = ObjectDefinition & {
    idString: Rarities
} & {
    color: string;
    border: string;
};

export const RarityDefinitions = new Definitions<RarityDefinition>([
    {
        idString: Rarities.common,
        displayName: "Common",
        color: "#7eef6d",
        border: "#66c258",
    },
    {
        idString: Rarities.unusual,
        displayName: "Unusual",
        color: "#ffe65d",
        border: "#cfba4b",
    },
    {
        idString: Rarities.rare,
        displayName: "Rare",
        color: "#4d52e3",
        border: "#3e42b8",
    },
    {
        idString: Rarities.epic,
        displayName: "Epic",
        color: "#861fde",
        border: "#6d19b4",
    },
    {
        idString: Rarities.legendary,
        displayName: "Legendary",
        color: "#de1f1f",
        border: "#b41919",
    },
    {
        idString: Rarities.super,
        displayName: "Super",
        color: "#2bffa3",
        border: "#23cf84",
    }
] as RarityDefinition[]);
