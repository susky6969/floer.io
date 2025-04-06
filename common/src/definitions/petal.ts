import { ServerPetal } from "../../../server/src/entities/serverPetal";
import { ObjectDefinition, Definitions } from "../utils/definitions";
import { MathGraphics } from "../utils/math";
import { Vec2 } from "../utils/vector";

export enum EventType{
    CAN_HEAL = "CAN_HEAL",
    DEFEND = "DEFEND",
}

export enum UsageAnimationType{
    ABSORB = "ABSORB",
    NORMAL = "NORMAL",
}

export type SavedPetalDefinitionData = PetalDefinition | null

export type PetalDefinition = ObjectDefinition & {
    readonly damage?: number
    readonly health?: number
    readonly reloadTime?: number
    readonly hitboxRadius: number
    readonly extendable: boolean
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
    readonly usages: PetalUsageData[]
}

export function getDisplayedPieces(petal: PetalDefinition): number {
    if (petal.isDuplicate && petal.isShowedInOne) return 1;
    return petal.pieceAmount;
}

export interface PetalUsageData{
    name: keyof typeof Usages
    data: Record<string, any>
}

interface Usage {
    readonly dataKeyName: string[]
    readonly event: EventType
    readonly type: UsageAnimationType
    readonly callback: (petal: ServerPetal, data: Record<string, any>) => void
}

export const Usages: Readonly<{ [key: string]: Usage}> = {
    "absorbing_heal": {
        dataKeyName: ["heal"],
        event: EventType.CAN_HEAL,
        type: UsageAnimationType.ABSORB,
        callback: (petal: ServerPetal, data: Record<string, any>) => {
            petal.owner.health += data.heal;
        }
    },
    "boost": {
        dataKeyName: ["distance"],
        event: EventType.DEFEND,
        type: UsageAnimationType.NORMAL,
        callback: (petal: ServerPetal, data: Record<string, any>) => {
            const direction =
                MathGraphics.directionBetweenPoints(petal.owner.position, petal.position);
            petal.owner.position = Vec2.add(
                petal.owner.position,
                Vec2.mul(direction, data.distance)
            )
        }
    }
} as const;

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
        pieceAmount: 5,
        isShowedInOne: false
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
        pieceAmount: 1
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
        isShowedInOne: true
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
        usages: [
            {
                name: "absorbing_heal",
                data: {"heal": 10}
            }
        ],
        reloadTime: 3.5,
        hitboxRadius: 0.5,
        displaySize: 35,
        isDuplicate: false,
        pieceAmount: 1
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
        usages: [
            {
                name: "boost",
                data: {"distance": 5}
            }
        ],
        reloadTime: 3.5,
        hitboxRadius: 0.6,
        displaySize: 45,
        isDuplicate: false,
        pieceAmount: 1
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
        hitboxRadius: 0.6,
        displaySize: 45,
        isDuplicate: false,
        pieceAmount: 1
    },
] satisfies PetalDefinition[]);
