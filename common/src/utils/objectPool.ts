import { ObjectType } from "../constants";

export interface GameObject {
    readonly type: ObjectType
    readonly id: number
}

export class ObjectPool {
    private readonly objects = new Map<number, GameObject>();
    private readonly byCategory: { [ C in ObjectType ]: Set<GameObject> };

    constructor() {
        this.byCategory = Object.keys(ObjectType)
            .filter(e => isNaN(+e))
            .reduce((acc, cur) => {
                    acc[cur as `${ObjectType}`] = new Set<GameObject>();
                    return acc;
                },
                {} as ObjectPool["byCategory"]
            );
    }

    clear(): void {
        this.objects.clear();
        Object.values(this.byCategory).forEach(e => e.clear());
    }

    add(object: GameObject): boolean {
        if (this.objects.has(object.id)) return false;
        this.objects.set(object.id, object);
        this.byCategory[object.type].add(object);
        return true;
    }

    delete(object: GameObject): boolean {
        return this.objects.delete(object.id);
    }

    has(object: GameObject): boolean {
        return this.objects.has(object.id);
    }

    get(id: number): GameObject | undefined {
        return this.objects.get(id);
    }

    hasID(id: number): boolean {
        return this.objects.has(id);
    }

    deleteByID(id: number): void {
        this.objects.delete(id);
    }

    get size(): number {
        return this.objects.size;
    }

    [Symbol.iterator](): Iterator<GameObject> {
        return this.objects.values();
    }
}
