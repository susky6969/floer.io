export enum EntityType {
    Player,
    Petal
}

export const GameConstants = {
    maxPosition: 2048,
    player: {
        radius: 2,
        defaultHealth: 100,
        maxHealth: 100,
        speed: 10,
        defaultName: "Player",
        maxNameLength: 20
    },
    petal: {
        rotationRadius: 0.8
    },
    game: {
        width: 100,
        height: 100
    },
    maxTokenLength: 20
};
