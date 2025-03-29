export enum EntityType {
    Player,
    Petal
}

export const GameConstants = {
    maxPosition: 2048,
    player: {
        radius: 25,
        defaultHealth: 100,
        maxHealth: 100,
        speed: 0.5,
        defaultName: "Player",
        maxNameLength: 20
    }
};
