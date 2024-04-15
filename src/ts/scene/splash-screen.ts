import { OFF_WHITE } from "@root/_graphics/colour";
import { push_text } from "@root/_graphics/text";
import { A_PRESSED } from "@root/_input/controls";
import { new_node } from "@root/node";
import { switch_scene } from "@root/scene";

export let create_splash_screen = (root_id: number): number =>
{
    let id = new_node(root_id, update_splash_screen, draw_splash_screen);

    return id;
};

let update_splash_screen = (node_id: number, x: number, y: number, delta: number): void =>
{
    if (A_PRESSED)
    {
        switch_scene(SCREEN_MENU);
    }
};

let draw_splash_screen = (node_id: number, x: number, y: number, delta: number): void =>
{
    push_text("splash screen", 0, 0);

    push_text("press action", SCREEN_CENTER_X, SCREEN_CENTER_Y, OFF_WHITE, 1, TEXT_ALIGN_CENTER, TEXT_ALIGN_MIDDLE);
};