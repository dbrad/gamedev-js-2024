type GameState = [
    MetaGameState,
    CurrentGameState,
];

type MetaGameState = [
    number, // STORY_PROGRESS
];

type CurrentGameState = [
];


type LevelMap = {
    w: number,
    h: number,
    m: number[];
};