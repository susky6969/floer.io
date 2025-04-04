import { ClientEntity } from "./clientEntity";
import { EntityType, GameConstants } from "@common/constants";
import { GameSprite } from "@/scripts/utils/pixi";
import { Game } from "@/scripts/game";
import { EntitiesNetData } from "@common/packets/updatePacket.ts";
import { Camera } from "@/scripts/render/camera.ts";
import { Text, Graphics } from "pixi.js";
import { MathGraphics, MathNumeric } from "@common/utils/math.ts";

export class ClientPlayer extends ClientEntity {
    type = EntityType.Player;

    images = {
        body: new GameSprite("flower_body.svg")
    };

    name: Text;

    health = GameConstants.player.defaultHealth;
    healthBar = new Graphics();

    constructor(game: Game, id: number) {
        super(game, id)

        this.images.body.setZIndex(-2)

        this.name = new Text({
            text: this.game.playerNames.get(id),
            style: {
                fontFamily: 'Ubuntu',
                fontSize: 14,
                fill: "#fff",
                stroke: {color: "#000", width: 2}
            }
        });

        this.name.anchor.set(0.5);
        this.name.position.set(0, -50);
        this.healthBar.position.set(0, 50);

        this.container.addChild(
            this.images.body,
            this.name,
            this.healthBar,
        );

        this.game.camera.addObject(this.container);
    }

    render(): void {
        const pos = Camera.vecToScreen(this.position);
        this.container.position = pos;
    }

    drawHealthBar(): void {
        const healthbarWidth = 80;
        const fillWidth = MathNumeric.remap(this.health, 0, GameConstants.player.maxHealth, 0, healthbarWidth);

        this.healthBar.visible = this.health < GameConstants.player.maxHealth;
        this.healthBar.clear()
            .roundRect(-healthbarWidth / 2, 0, healthbarWidth, 10)
            .fill({
                color: 0x000000,
                alpha: 0.3
            })
            .roundRect((-healthbarWidth + 5) / 2, 3 / 2, fillWidth - 5, 7)
            .fill({
                color: 0x87e63e
            });
    }

    updateFromData(data: EntitiesNetData[EntityType.Player], _isNew: boolean): void {
        this.position = data.position;
        if (data.full) {
             this.health = data.full.health;
             this.drawHealthBar();
        }
    }

    destroy() {
        this.game.camera.container.removeChild(this.container);
    }
}
