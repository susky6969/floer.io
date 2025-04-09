import { ServerEntity } from "../entities/serverEntity";
import { EntityType } from "../../../common/src/constants";
import { PlayerModifiers } from "../../../common/src/typings";
import { ServerPlayer } from "../entities/serverPlayer";

export interface EffectData{
    readonly effectedTarget: ServerEntity
    readonly workingType?: EntityType[]
    readonly duration: number
    readonly func?: (dt: number, effected: ServerEntity) => void
    readonly modifier?: Partial<PlayerModifiers>
}

export class Effect {
    time: number = 0;

    hasStarted: boolean = false;

    effectedTarget: ServerEntity;
    workingType?: EntityType[];
    duration: number;
    func?: EffectData["func"];
    modifier?: Partial<PlayerModifiers>;

    constructor(data: EffectData) {
        this.effectedTarget = data.effectedTarget;
        this.workingType = data.workingType;
        this.duration = data.duration;
        this.func = data.func;
        this.modifier = data.modifier;
    }

    start() {
        if (this.workingType && !this.workingType.includes(this.effectedTarget.type)) return;
        this.effectedTarget.effects.addEffect(this);
        this.hasStarted = true;
    }

    tick(dt: number) {
        this.time += dt;
        if(this.func) this.func(dt, this.effectedTarget);
        if (this.time >= this.duration) this.destroy();
    }

    destroy() {
        this.effectedTarget.effects.removeEffect(this);
    }
}

export class EffectManager {
    effects= new Set<Effect>();

    constructor(public owner: ServerEntity) {}

    tick() {
        this.effects.forEach(e => {
            e.tick(this.owner.game.dt);
        })
    }

    addEffect(effect: Effect) {
        if (effect.effectedTarget != this.owner) return;
        this.effects.add(effect);
        if(this.owner instanceof ServerPlayer) this.owner.updateModifiers();
    }

    removeEffect(effect: Effect) {
        if (effect.effectedTarget != this.owner) return;
        this.effects.delete(effect);
        if(this.owner instanceof ServerPlayer) this.owner.updateModifiers();
    }
}
