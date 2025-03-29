import { EntityType } from "../constants";

export interface IGameObject {
    readonly type: EntityType
    readonly id: number
}

export class EntityPool<T extends { [Cat in EntityType]: IGameObject }> {
    private readonly entities = new Map<number, IGameObject>();
    clear(): void {
        this.entities.clear();
    }

    add(entity: T[EntityType]): boolean {
        if (this.entities.has(entity.id)) return false;
        this.entities.set(entity.id, entity);
        return true;
    }

    delete(entity: T[EntityType]): boolean {
        // this.byCategory[entity.type].delete(entity);
        return this.entities.delete(entity.id);
    }

    has(entity: T[EntityType]): boolean {
        return this.entities.has(entity.id);
    }

    get(id: number): T[EntityType] | undefined {
        return this.entities.get(id);
    }

    hasID(id: number): boolean {
        return this.entities.has(id);
    }

    deleteByID(id: number): void {
        this.entities.delete(id);
    }

    get size(): number {
        return this.entities.size;
    }

    [Symbol.iterator](): Iterator<T[EntityType]> {
        return this.entities.values();
    }
}
