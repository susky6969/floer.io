import { Game } from "@/scripts/game.ts";
import { Graphics, Container, Text } from "pixi.js";
import { MathNumeric } from "@common/utils/math.ts";
import { getLevelInformation } from "@common/utils/levels.ts";

export class ExpUI {
    expGraphics: Graphics = new Graphics();
    expText: Text = new Text({
        text: "",
        style: {
            fontFamily: 'Ubuntu',
            fontSize: 16,
            fill: "#fff",
            stroke: {color: "#000", width: 2}
        }
    });

    exp: number = 0;
    currentExpWidth: number = 30; // Starting width for animation

    container = new Container();

    width: number = 325;
    height: number = 39;

    constructor(private game: Game) {}

    init(){
        this.expText.anchor.set(0.5);

        this.container.addChild(
            this.expGraphics,
            this.expText
        );
        this.game.pixi.stage.addChild(
            this.container
        );

        this.resize();
    }

    render(){
        const levelInfo = getLevelInformation(this.exp);

        const targetExpWidth = Math.max(
            MathNumeric.remap(levelInfo.remainsExp, 0, levelInfo.toNextLevelExp, 0, this.width - 8),
            30 // set minimum width so that it won't look weird
        );
        
        // Use targetEasing for smooth animation
        this.currentExpWidth = MathNumeric.targetEasing(this.currentExpWidth, targetExpWidth, 10);
        
        this.expGraphics.clear()
            .roundRect(0, 0, this.width, this.height, 100)
            .fill({ color: 0x232323, alpha: 0.7 })
            .roundRect(8/2, 8/2, this.currentExpWidth, this.height - 8, 100)
            .fill({ color: 0xd8f060, alpha: 1 });

        this.expText.position.set(this.width / 2, this.height / 2);

        this.expText.text = `Lvl ${levelInfo.level} Flower`;
    }

    resize(): void {
        const screenWidth = this.game.pixi.screen.width;
        const screenHeight = this.game.pixi.screen.height;

        const positionX = 10;
        const positionY = screenHeight - this.height - 10;

        this.container.position.set(positionX, positionY);
    }
}
