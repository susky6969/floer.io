import { Game } from "@/scripts/game.ts";
import { Graphics } from "pixi.js";
import { MathNumeric } from "@common/utils/math.ts";
import { Vec2 } from "@common/utils/vector.ts";

export class Minimap {
    mapBackground = new Graphics({
        zIndex: 1
    });

    playerPosition = new Graphics({
        zIndex: 2
    })
    private minimapPositionX: number = 0;
    private minimapPositionY: number = 0;
    private minimapWidth: number = 0;
    private minimapHeight: number = 0;
    private width: number = 0;
    private height: number = 0;

    constructor(private game: Game) {}

    init(){
       this.mapBackground.addChild(this.playerPosition);
       this.game.pixi.stage.addChild(
           this.mapBackground
       );
    }

    render(){
        const position = this.game.activePlayer?.position;

        if (position) {
            const remappedX =
                this.minimapPositionX
                + MathNumeric.remap(position.x, 0, this.width, 0, this.minimapWidth);
            const remappedY =
                this.minimapPositionY
                + MathNumeric.remap(position.y, 0, this.height, 0, this.minimapHeight);
            this.playerPosition.clear()
                .circle(
                    remappedX,
                    remappedY,
                    5
                ).fill(0xfee763);
        }
    }

    resize(): void {
        this.width = this.game.width;
        this.height = this.game.height;

        const screenWidth = this.game.pixi.screen.width;
        const screenHeight = this.game.pixi.screen.height;

        this.minimapWidth = this.width / 8;
        this.minimapHeight = this.height / 2;

        this.minimapPositionX = screenWidth - this.minimapWidth - 8;
        this.minimapPositionY = screenHeight - this.minimapHeight - 8;

        this.mapBackground.clear()
            .rect(
                this.minimapPositionX,
                this.minimapPositionY,
                this.minimapWidth,
                this.minimapHeight
            )
            .fill({
                color: 0x000,
                alpha: 0.5
            });
    }
}
