import { Vec2 } from "@common/utils/vector.ts";
import { type Game } from "./game";

export class Input {
    readonly game: Game;

    private _inputsDown: Record<string, boolean> = {};

    /**
     * The angle between the mouse pointer and the screen center
     */
    mouseDir = Vec2.new(0, 0);

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

        window.addEventListener("pointerdown", this.handleMouseEvent.bind(this, true));
        window.addEventListener("pointerup", this.handleMouseEvent.bind(this, false));

        window.addEventListener("mousemove", e => {
            const rotation = Math.atan2(window.innerHeight / 2 - e.clientY, window.innerWidth / 2 - e.clientX) - Math.PI / 2;

            this.mouseDir = Vec2.new(
                Math.sin(rotation),
                -Math.cos(rotation)
            );
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
