export enum EntityType {
    Player,
    Petal,
    Mob
}

export const GameConstants = {
    maxPosition: 2048,
    player: {
        radius: 1.5,
        defaultBodyDamage: 5,
        defaultHealth: 100,
        maxHealth: 100,
        maxSpeed: 8,
        defaultName: "Player",
        maxNameLength: 20,
        spawnMaxX: 100,
        spawnMaxY: 50,
        revolutionSpeed: 2
    },
    petal: {
        rotationRadius: 0.5,
        useReload: 0.9
    },
    game: {
        width: 2048,
        height: 50
    },
    mob: {
        maxHealth: 100000,
        walkingReload: 2,
        walkingTime: 1
    },
    maxTokenLength: 20
};
