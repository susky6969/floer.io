import { ClientEntity } from "./clientEntity";
import { EntityType } from "@common/constants";
import { GameSprite, getGameAssetsPath } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { PetalDefinition } from "@common/definitions/petal.ts";
import { Graphics, Text, Container } from "pixi.js";
import { Vec2 } from "@common/utils/vector.ts";
import { MathGraphics, P2 } from "@common/utils/math.ts";
import { RarityDefinitions } from "@common/definitions/rarity.ts";

const defaultCenter = Vec2.new(0, -4);

const defaultRadius = 6;
const defaultBoxSize = 50;

function drawPetalPiece(
    xOffset: number, yOffset: number, displaySize: number, petal: PetalDefinition
) {
    const size = GameSprite.getScaleByUnitRadius(displaySize / defaultBoxSize / 2);
    const center = Vec2.sub(defaultCenter, size);

    const piece = new GameSprite(getGameAssetsPath("petal", petal));

    piece.scale = size;
    const { x, y } = center;
    piece.position.set(x + xOffset, y + yOffset);
    piece.setRotation(petal.images?.slotRotation)

    return piece;
}

function drawPetal(petal_box: Container, petal: PetalDefinition) {
    const displaySize = petal.images?.slotDisplaySize ?? 25;

    if (petal.isDuplicate) {
        let radiansNow = 0;
        const count = petal.pieceAmount;

        for (let i = 0; i < count; i++) {
            const { x, y } = MathGraphics.getPositionOnCircle(radiansNow, defaultRadius)
            petal_box.addChild(
                drawPetalPiece(x, y,displaySize, petal)
            );

            radiansNow += P2 / count;
        }
    } else {
        petal_box.addChild(
            drawPetalPiece(0, 0, displaySize, petal)
        );
    }

    return petal_box;
}

export class ClientLoot extends ClientEntity {
    type = EntityType.Loot;

    background = new Graphics();

    pieces: Container = new Container();

    name: Text = new Text({
        style: {
            fontFamily: 'Ubuntu',
            fontSize: 10,
            fill: "#fff",
            stroke: {color: "#000", width: 2}
        }
    });

    definition!: PetalDefinition;

    constructor(game: Game, id: number) {
        super(game, id);

        this.game.camera.addObject(this.container);
    }

    render(): void {
        this.container.position = Camera.vecToScreen(this.position);
    }

    init(): void{
        const rarity = RarityDefinitions.fromString(this.definition.rarity);

        this.background.clear()
            .rect(-25, -25, 50, 50)
            .fill(rarity.border)
            .rect(-22, -22, 44, 44)
            .fill(rarity.color);

        this.container.zIndex = -1;

        this.background.zIndex = -1;

        drawPetal(this.container, this.definition);

        this.name.text = this.definition.displayName;

        this.name.anchor.set(0.5);
        this.name.position.set(0, 13)

        this.name.zIndex = 0;

        this.container.addChild(
            this.pieces,
            this.background,
            this.name
        );
    }

    updateFromData(data: EntitiesNetData[EntityType.Petal], isNew: boolean): void {
        this.position = data.position;

        if (isNew){
            this.definition = data.definition;

            this.init();
        }
    }
}
