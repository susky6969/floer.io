import { Definitions, ObjectDefinition } from "../utils/definitions";

type AttributeDefinition = ObjectDefinition;

const petalAttributeDefinitions = [
    {
        idString: "absorbing_heal",
        displayName: "Heal"
    },
    {
        idString: "boost",
        displayName: "Boost"
    }
] as const;

export const PetalAttributes = new Definitions<AttributeDefinition>(
    petalAttributeDefinitions
);

export type PetalAttributeName =
    typeof petalAttributeDefinitions[number]["idString"];
