import { zzfx_init, zzfx_play } from "./zzfx";

let sfx_map: number[][] = [];

export function init_sfx_system(): void 
{
    zzfx_init();
    // sfx_map[SFX_BOOP] = zzfx_generate(...[, .1, , .05, .05, , , , , , 200, .06, , , , , , .5, .05]);
};

export function play_sfx(sfx: number): void 
{
    zzfx_play(sfx_map[sfx]);
};