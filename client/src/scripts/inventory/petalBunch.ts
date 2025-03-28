import { PetalCopyType, PetalDefinition, PetalMultipleType } from "@common/definitions/petal.ts";
import { Petal } from "@/scripts/objects/petal.ts";
import { Game } from "@/scripts/game.ts";
import { Inventory } from "@/scripts/inventory/inventory.ts";
import * as math from "@/scripts/utils/math.ts";
import { Vec2 } from "@common/utils/vector";

export class PetalBunch {
    readonly petalsCount: number;
    readonly displayPetalsCount: number;
    readonly definition: PetalDefinition;
    private petals: Petal[] = [];

    radian: number = 0;

    constructor(game: Game, definition: PetalDefinition) {
        this.definition = definition;
        if (definition.multiple === PetalCopyType.Multiple) {
            this.petalsCount = definition.pieceNumber;
            this.displayPetalsCount
                = (definition.multipleDisplay === PetalMultipleType.ShowInOne ? 1 : definition.pieceNumber) as number;
        } else {
            this.petalsCount = 1;
            this.displayPetalsCount = 1;
        }
        for (let i = 0; i < this.petalsCount; i++) {
            this.petals.push(new Petal(game, game.nextObjectID));
            game.objectPool.add(this.petals[i]);
        }
    }

    update(inv: Inventory, radianNow: number, plusRadian: number): void {
        this.radian += 0.01;
        let radian = radianNow;
        const center_x = Math.cos(radian) * inv.radius;
        const center_y = Math.sin(radian) * inv.radius;
        const center = Vec2.new(center_x, center_y);
        if (this.definition.multiple === PetalCopyType.One) {
            this.petals[0].position = center;
        } else {
            const piece = this.definition.pieceNumber;
            if (this.definition.multipleDisplay === PetalMultipleType.ShowInOne) {
                let internal_radian = this.radian;
                this.petals.forEach(petal => {
                    const x = Math.cos(internal_radian) * 20 + center_x;
                    const y = Math.sin(internal_radian) * 20 + center_y;
                    petal.position = Vec2.new(x, y);
                    internal_radian += math.P2 / piece;
                });
            } else {
                this.petals.forEach(petal => {
                    const x = Math.cos(radian) * inv.radius;
                    const y = Math.sin(radian) * inv.radius;
                    petal.position = Vec2.new(x, y);
                    radian += plusRadian;
                });
            }
        }
    }
}
