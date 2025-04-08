import { PetalAttributeEvents, PetalAttributeRealizes, PetalUsingAnimations } from "./attribute";
import { PetalAttributeName } from "../../../common/src/definitions/attribute";
import { ServerPetal } from "../entities/serverPetal";

type EventFunction = () => void;
export type EventInitializer =
    (on: PetalAttributeEvents, func: EventFunction, usable?: PetalUsingAnimations) => void;

interface PetalEventData {
    petal: ServerPetal;
    attributeName: PetalAttributeName;
    event: PetalAttributeEvents;
    func: EventFunction;
    use?: PetalUsingAnimations;
}

export class PetalAttributeEventManager{
    private _feature_events = new Set<PetalEventData>;
    private _by_event = new Map<string, Set<PetalEventData>>;

    constructor() {
        for (const e in PetalAttributeEvents){
            this._by_event.set(e, new Set<PetalEventData>);
        }
    }

    loadPetal(petal: ServerPetal) {
        for (const name in petal.definition.attributes) {
            this.addAttribute(petal, name as PetalAttributeName);
        }
    }

    addAttribute(petal: ServerPetal, name: PetalAttributeName) {
        if (!petal.definition.attributes) return
        PetalAttributeRealizes[name].callback(
            this.getEventInitializer(petal, name),
            petal,
            petal.definition.attributes[name]
        );
    }

    getEventInitializer(petal: ServerPetal, name: PetalAttributeName): EventInitializer {
        let em: PetalAttributeEventManager = this;
        return function(on, func, use?) {
            em.addEvent(petal, name, on, func, use);
        }
    }

    addEvent(petal: ServerPetal
             , name: PetalAttributeName
             , event: PetalAttributeEvents
             , func: EventFunction
             , use?: PetalUsingAnimations) {
        const data: PetalEventData = {
            petal: petal,
            attributeName: name,
            event,
            func,
            use
        };
        this._feature_events.add(data);
        this._by_event.get(event as string)?.add(data);
    }

    removePetal(petal: ServerPetal) {
        const petalId = petal.id;
        this._feature_events.forEach((e: PetalEventData) => {
            if(e.petal.id === petalId) {
                this._feature_events.delete(e);
                this._by_event.get(e.event as string)?.delete(e);
            }
        })
    }

    sendEvent(event: PetalAttributeEvents) {
        this._by_event.get(event as string)?.forEach((e: PetalEventData) => {
            this.applyEvent(e);
        })
    }

    sendEventById(petal: ServerPetal, event: PetalAttributeEvents) {
        this._by_event.get(event as string)?.forEach((e: PetalEventData) => {
            if(e.petal.id == petal.id){
                this.applyEvent(e);
            }
        })
    }

    applyEvent(e: PetalEventData){
        if (!e.petal.isActive() || e.use && !e.petal.canUse) return;
        e.func();
        if (e.use) e.petal.startUsing(e.use);
    }
}
