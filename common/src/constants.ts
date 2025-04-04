export enum EntityType {
    Player,
    Petal
}

export const GameConstants = {
    maxPosition: 2048,
    player: {
        radius: 2,
        defaultBodyDamage: 5,
        defaultHealth: 100,
        maxHealth: 100,
        maxSpeed: 10,
        defaultName: "Player",
        maxNameLength: 20
    },
    petal: {
        rotationRadius: 0.5
    },
    game: {
        width: 100,
        height: 100
    },
    maxTokenLength: 20
};
