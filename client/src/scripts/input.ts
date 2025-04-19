import { Vec2, Vector } from "@common/utils/vector.ts";
import { type Game } from "./game";
import { halfPI, P2, PI } from "@common/utils/math.ts";

export class Input {
    readonly game: Game;

    private _inputsDown: Record<string, boolean> = {};

    /**
     * The angle between the mouse pointer and the screen center
     */
    mouseDirection = 0;

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

    get moveDirection(): number | undefined {
        if (this.game.app.settings.data.keyboardMovement) {
            let hMove = 0;
            let vMove = 0;
            if (this.isInputDown("KeyD")) hMove += 1;
            if (this.isInputDown("KeyA")) hMove -= 1;
            if (this.isInputDown("KeyW")) vMove += 1;
            if (this.isInputDown("KeyS")) vMove -= 1;

            const hRad = -halfPI * hMove + halfPI;
            const vRad = PI / 2 * vMove + PI / 2 + halfPI;

            const hDir = Vec2.radiansToDirection(hRad);
            const vDir = Vec2.radiansToDirection(vRad);

            if (hMove != 0 && vMove != 0) {
                const res = Vec2.directionToRadians(Vec2.add(vDir, hDir));
                if (res < 0) return res + P2;
                return res
            } else if (hMove != 0) {
                return hRad;
            } else if (vMove != 0) {
                return vRad;
            }

            return;
        }else {
            return this.mouseDirection;
        }
    }

    get moveDistance(): number {
        const maxDistance = 255;
        let distance: number;
        if (this.game.app.settings.data.keyboardMovement) {
            if (this.moveDirection != undefined) distance = maxDistance;
            else distance = 0;
        }else {
            distance = this.mouseDistance;
        }

        if (distance > maxDistance) return maxDistance;
        return distance;
    }

    constructor(game: Game) {
        this.game = game;

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        window.addEventListener("mousedown",
            this.handleMouseEvent.bind(this, true)
        );
        window.addEventListener("mouseup",
            this.handleMouseEvent.bind(this, false)
        );
        window.addEventListener("keydown",
            this.handleKeyboardEvent.bind(this, true));

        window.addEventListener("keyup",
            this.handleKeyboardEvent.bind(this, false))

        window.addEventListener("mousemove", e => {
            this.mouseDirection = Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2);

            this.mouseDistance = Vec2.length(
                Vec2.new(
                    e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2
                )
            );
        });
    }


    handleMouseEvent(down: boolean, event: MouseEvent): void {
        const key = this.getKeyFromInputEvent(event);

        this._inputsDown[key] = down;
    }

    handleKeyboardEvent(down: boolean, event: KeyboardEvent): void {
        if (!this.game.running) return;
        const key = this.getKeyFromInputEvent(event);

        if (down) {
            if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(event.key)) {
                if (this.game.app.settings.data.newControl) {
                    if (this.isInputDown("KeyT")) {
                        this.game.inventory.deleteSlot(
                            this.game.inventory.equippedPetals.length + (+event.key) - 1
                        );
                    } else {
                        this.game.inventory.switchSlot(+event.key - 1);
                    }
                }else {
                    this.game.inventory.switchSelectingSlotTo(+event.key - 1);
                }
            }

            if (!this.game.app.settings.data.newControl) {
                if (event.key === "q") {
                    this.game.inventory.moveSelectSlot(-1);
                }

                if (event.key === "e") {
                    this.game.inventory.moveSelectSlot(1);
                }

                if (event.key === "t") {
                    this.game.inventory.deleteSelectingSlot();
                }
            }

            if (event.key === "k") {
                this.game.ui.keyboardMovement.trigger("click")
            }

            if (event.key === "x" || event.key === "r") {
                this.game.inventory.transformAllSlot();
            }
        }

        this._inputsDown[key] = down;
    }

    getKeyFromInputEvent(event: MouseEvent | KeyboardEvent): string {
        let key = "";
        if (event instanceof MouseEvent) {
            key = `Mouse${event.button}`;
        }

        if (event instanceof KeyboardEvent) {
            key = `Key${event.key.toUpperCase()}`;
        }

        return key;
    }
}
