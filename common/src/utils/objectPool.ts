import { ObjectType } from "../constants";

export interface IGameObject {
    readonly type: ObjectType
    readonly id: number
}

export class ObjectPool<T extends { [Cat in ObjectType]: IGameObject }> {
    private readonly objects = new Map<number, IGameObject>();
    clear(): void {
        this.objects.clear();
    }

    add(object: T[ObjectType]): boolean {
        if (this.objects.has(object.id)) return false;
        this.objects.set(object.id, object);
        return true;
    }

    delete(object: T[ObjectType]): boolean {
        // this.byCategory[object.type].delete(object);
        return this.objects.delete(object.id);
    }

    has(object: T[ObjectType]): boolean {
        return this.objects.has(object.id);
    }

    get(id: number): T[ObjectType] | undefined {
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

    [Symbol.iterator](): Iterator<T[ObjectType]> {
        return this.objects.values();
    }
}
