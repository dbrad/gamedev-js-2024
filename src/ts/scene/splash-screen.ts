import { OFF_WHITE, WHITE } from "@root/_graphics/colour";
import { push_text } from "@root/_graphics/text";
import { A_PRESSED } from "@root/_input/controls";
import { GAME_STATE, init_game_state } from "@root/game-state";
import { home_base } from "@root/gameplay/map";
import { switch_scene } from "@root/scene";
import { VERSION } from "@root/version";

export let update_splash_screen = (delta: number): void =>
{
    if (!GAME_STATE)
    {
        init_game_state();
    }
    if (A_PRESSED)
    {
        GAME_STATE[0] = home_base();
        switch_scene(SCREEN_GAME);
    }
};

export let draw_splash_screen = (delta: number): void =>
{
    push_text("press action", SCREEN_CENTER_X, SCREEN_CENTER_Y, OFF_WHITE, 1, TEXT_ALIGN_CENTER, TEXT_ALIGN_MIDDLE);
    push_text(VERSION, SCREEN_WIDTH, SCREEN_HEIGHT, WHITE, 1, TEXT_ALIGN_RIGHT, TEXT_ALIGN_BOTTOM);
};