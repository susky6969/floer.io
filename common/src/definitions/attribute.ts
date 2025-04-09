import { Definitions, ObjectDefinition } from "../utils/definitions";

type AttributeDefinition = ObjectDefinition;

const AttributeDefinitions = [
    {
        idString: "absorbing_heal",
        displayName: "Heal"
    },
    {
        idString: "boost",
        displayName: "Boost"
    },
    {
        idString: "poison",
        displayName: "Poison"
    },
    {
        idString: "healing_debuff",
        displayName: "Healing Debuff"
    },
    {
        idString: "body_poison",
        displayName: "Body Poison"
    },
    {
        idString: "damage_reflection",
        displayName: "Damage Reflection"
    }
] as const;

export const Attributes = new Definitions<AttributeDefinition>(
    AttributeDefinitions
);

export type AttributeName =
    typeof AttributeDefinitions[number]["idString"];
