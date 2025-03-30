import { Sprite, Assets, Texture, type ColorSource } from "pixi.js";
import { Vec2, Vector } from "@common/utils/vector";

const rootDir = "res/game";

let fullLoaded = false;
export let unloadedSprites: Map<FloerSprite, string> | undefined;

export class FloerSprite extends Sprite {
    static getTexture(frame: string): Texture {
        if (!Assets.cache.has(frame)) {
            console.warn(`Texture not found: "${frame}"`);
            frame = "_missing_texture";
        }
        return Texture.from(frame);
    }

    constructor(frame?: string) {
        super(frame ? FloerSprite.getTexture(frame) : undefined);
        if (!fullLoaded && frame) {
            (unloadedSprites ??= new Map<FloerSprite, string>()).set(this, frame);
        }

        this.anchor.set(0.5);
        this.setPos(0, 0);
    }

    setFrame(frame: string, force?: boolean): this {
        if (!fullLoaded && !force) {
            // @ts-expect-error technically this shouldn't be undefined, but there isn't a way around it so
            this.texture = undefined;
            (unloadedSprites ??= new Map<FloerSprite, string>()).set(this, frame);
            return this;
        }

        this.texture = FloerSprite.getTexture(frame);
        return this;
    }

    setAnchor(anchor: Vector): this {
        this.anchor.copyFrom(anchor);
        return this;
    }

    setPivot(pivot: Vector): this {
        this.pivot.copyFrom(pivot);
        return this;
    }

    setPos(x: number, y: number): this {
        this.position.set(x, y);
        return this;
    }

    setVPos(pos: Vector): this {
        this.position.set(pos.x, pos.y);
        return this;
    }

    setVisible(visible: boolean): this {
        this.visible = visible;
        return this;
    }

    setAngle(angle?: number): this {
        this.angle = angle ?? 0;
        return this;
    }

    setRotation(rotation?: number): this {
        this.rotation = rotation ?? 0;
        return this;
    }

    setScale(scale?: number): this {
        this.scale = Vec2.new(scale ?? 1, scale ?? 1);
        return this;
    }

    setTint(tint: ColorSource): this {
        this.tint = tint;
        return this;
    }

    setZIndex(zIndex: number): this {
        this.zIndex = zIndex;
        return this;
    }

    setAlpha(alpha: number): this {
        this.alpha = alpha;
        return this;
    }
}

function getURL(type: string, path: string): string {
    return [rootDir, type, path].join("/");
}

async function loadTexture(idString: string, type: string, path: string): Promise<void> {
    Assets.add({ alias: idString, src: getURL(type, path) });
    await Assets.load(idString);
}

const AllTextures: Record<string, [string, string]> = {
    flower: ["flower", "flower.svg"],
    petal_light: ["petals", "light.svg"]
};

export async function loadTextures(): Promise<void> {
    for (const idString in AllTextures) {
        await loadTexture(idString, AllTextures[idString][0], AllTextures[idString][1]);
    }
    fullLoaded = true;

    if (unloadedSprites) unloadedSprites.forEach((v, k) => { k.setFrame(v); });
}
