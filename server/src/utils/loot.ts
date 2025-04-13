import { PetalDefinition } from "../../../common/src/definitions/petal";
import { Vector } from "../../../common/src/utils/vector";
import { ServerLoot } from "../entities/serverLoot";
import { MathGraphics, P2 } from "../../../common/src/utils/math";
import { Game } from "../game";
import { GameConstants } from "../../../common/src/constants";
import { Rarity } from "../../../common/src/definitions/rarity";

export function spawnLoot(game: Game, loots: PetalDefinition[], position: Vector): void {
    if (loots.length <= 0) return;
    if (loots.length > 1) {
        let radiansNow = 0;
        const everyOccupiedRadians = P2 / loots.length;
        loots.forEach(loot => {
            if (Rarity.fromString(loot.rarity).isUnique && game.hasPlayerHas(loot)) {
                return;
            }
            new ServerLoot(game,
                MathGraphics.getPositionOnCircle(radiansNow, GameConstants.loot.spawnRadius, position), loot
            )
            radiansNow += everyOccupiedRadians;
        })
    } else {
        const loot = loots[0];
        if (Rarity.fromString(loot.rarity).isUnique && game.hasPlayerHas(loot)) {
            return;
        }
        new ServerLoot(game, position, loot)
    }
}
