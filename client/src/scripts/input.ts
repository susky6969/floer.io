import { Vec2 } from "@common/utils/vector.ts";
import { type Game } from "./game";

export class Input {
    readonly game: Game;

    private _inputsDown: Record<string, boolean> = {};

    /**
     * The angle between the mouse pointer and the screen center
     */
    mouseDirection = Vec2.new(0, 0);

    /**
     * The distance between the mouse pointer and the screen center
     */
    mouseDistance = 0;

    /**
     * Gets if an input is down
     * @param input The input key or mouse button
     * Single keys must be upper case
     * Mouse buttons are `Mouse${ButtonNumber}`
     * @returns true if the bind is pressed
     */
    isInputDown(input: string): boolean {
        return this._inputsDown[input] ?? false;
    }

    constructor(game: Game) {
        this.game = game;

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        window.addEventListener("pointerdown", this.handleMouseEvent.bind(this, true));
        window.addEventListener("pointerup", this.handleMouseEvent.bind(this, false));

        window.addEventListener("mousemove", e => {
            const rotation = Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2);

            this.mouseDirection = Vec2.new(
                Math.cos(rotation),
                Math.sin(rotation)
            );

            const distance = Vec2.length(
                Vec2.new(
                    e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2
                )
            );

            this.mouseDistance = distance;

            if (distance > 255)
                this.mouseDistance = 255;
        });
    }


    handleMouseEvent(down: boolean, event: MouseEvent): void {
        const key = this.getKeyFromInputEvent(event);

        this._inputsDown[key] = down;
    }

    getKeyFromInputEvent(event: MouseEvent): string {
        let key = "";
        if (event instanceof MouseEvent) {
            key = `Mouse${event.button}`;
        }

        return key;
    }
}
