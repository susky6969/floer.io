export type ObjectDefinition = {
    readonly idString: string
    readonly displayName: string
};

type IdStringOf<T extends ObjectDefinition> = T["idString"];

export class Definitions<Def extends ObjectDefinition = ObjectDefinition> {
    readonly definitions: readonly Def[];
    private readonly idStringToNumberMap = new Map<string, number>();
    private readonly idStringToDefMap = new Map<string, Def>();

    /**
     * Whether there are more than 256 definitions in this schema, requiring 2 bytes to serialize
     */
    readonly overLength: boolean;

    constructor(definitions: readonly Def[]) {
        this.definitions = definitions;

        let idx = 0;
        for (const def of definitions) {
            const idString = def.idString;
            if (this.idStringToDefMap.has(idString)) {
                throw new Error(`Duplicate idString '${idString}' in schema`);
            }

            // casting here is necessary to modify the readonly defs
            this.idStringToDefMap.set(idString, def);
            this.idStringToNumberMap.set(idString, idx++);
        }
        this.overLength = idx > 255;
    }

    idStringToNumber(idString: string) {
        if (!this.idStringToNumberMap.has(idString)) {
            throw new Error(`Can't find ${idString} in definitions.`);
        }
        return this.idStringToNumberMap.get(idString)!;
    }

    reify<U extends Def = Def>(type: IdStringOf<Def> | Def): U {
        return typeof type === "string"
            ? this.fromString<U>(type)
            : type as U;
    }

    fromString<Spec extends Def = Def>(idString: IdStringOf<Spec>): Spec {
        const def = this.fromStringSafe(idString);
        if (def === undefined) {
            throw new ReferenceError(`Unknown idString '${idString}' for this schema`);
        }
        return def;
    }

    fromStringSafe<Spec extends Def = Def>(idString: IdStringOf<Spec>): Spec | undefined {
        return this.idStringToDefMap.get(idString) as Spec | undefined;
    }

    hasString(idString: string): boolean {
        return this.idStringToDefMap.has(idString);
    }

    // writeToStream(stream: ByteStream, def: ReifiableDef<Def>): void {
    //     const idString = typeof def === "string" ? def : def.idString;
    //     if (!this.hasString(idString)) {
    //         throw new Error(`Unknown idString '${idString}' for this schema`);
    //     }
    //     const idx = this.idStringToNumber[idString];
    //     if (this.overLength) {
    //         stream.writeUint16(idx);
    //     } else {
    //         stream.writeUint8(idx);
    //     }
    // }
    //
    // readFromStream<Spec extends Def>(stream: ByteStream): Spec {
    //     const idx = this.overLength ? stream.readUint16() : stream.readUint8();
    //     const def = this.definitions[idx];
    //     if (def === undefined) {
    //         throw new RangeError(`Bad index ${idx} in schema`);
    //     }
    //     if (!this.hasString(def.idString)) {
    //         throw new Error(`Unknown idString '${def.idString}' for this schema`);
    //     }
    //     return def as Spec;
    // }

    [Symbol.iterator](): Iterator<Def> {
        return this.definitions[Symbol.iterator]();
    }
}
