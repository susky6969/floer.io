import { Definitions, ObjectDefinition } from "../utils/definitions";

export enum RarityName {
    common = "common",
    unusual = "unusual",
    rare = "rare",
    epic = "epic",
    legendary = "legendary",
    super = "super"
}

type RarityDefinition = ObjectDefinition & {
    idString: RarityName
} & {
    color: string;
    border: string;
    expWhenAbsorb: number;
};

export const Rarity = new Definitions<RarityDefinition>([
    {
        idString: RarityName.common,
        displayName: "Common",
        color: "#7eef6d",
        border: "#66c258",
        expWhenAbsorb: 2
    },
    {
        idString: RarityName.unusual,
        displayName: "Unusual",
        color: "#ffe65d",
        border: "#cfba4b",
        expWhenAbsorb: 10
    },
    {
        idString: RarityName.rare,
        displayName: "Rare",
        color: "#4d52e3",
        border: "#3e42b8",
        expWhenAbsorb: 50
    },
    {
        idString: RarityName.epic,
        displayName: "Epic",
        color: "#861fde",
        border: "#6d19b4",
        expWhenAbsorb: 200
    },
    {
        idString: RarityName.legendary,
        displayName: "Legendary",
        color: "#de1f1f",
        border: "#b41919",
        expWhenAbsorb: 1000
    },
    {
        idString: RarityName.super,
        displayName: "Super",
        color: "#2bffa3",
        border: "#23cf84",
        expWhenAbsorb: 10000
    }
] as RarityDefinition[]);
