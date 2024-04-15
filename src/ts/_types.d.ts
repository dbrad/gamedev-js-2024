type GameState = [
    MetaGameState,
    CurrentGameState,
];

type MetaGameState = [
    number, // STORY_PROGRESS
];

type Player = [
    name: string,
    power: number,
    max_power: number,
    scrap: number,
    bolts: number,
    lost_tech: number,
    inventory: number[]
];

type MapObject = [
    pos: V2,
    type: number,
    index: number
];

type Chest = [
    difficulty: number,
    locked: boolean,
    contents: number[]
];

type Pile = [
    scrap: number,
    bolts: number,
    contents: number[],
];

type VendingMachine = [
    inventory: number[]
];

type DoorTerminal = [
    doorIndex: number
];

type NPC = [
    name: string,
    power: number,
    max_power: number,
    colour: number,
    role: number,
];

type CurrentGameState = [
    map: LevelMap,
    player: Player,
    npcs: NPC[]
];

type Door = {
    r: Rect,
    t: V2,
    h: boolean,
    o: boolean,
};

type Loot = {
    p: V2,
};

type LevelMap = {
    w: number,
    h: number,
    m: number[],
    v: boolean[],
    s: V2,
    d: Door[],
    l: Loot[],
};