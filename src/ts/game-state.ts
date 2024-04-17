export let GAME_STATE: CurrentGameState;

export let init_game_state = (): void =>
{
    GAME_STATE = [{} as LevelMap, [] as unknown as Player, []];
};
