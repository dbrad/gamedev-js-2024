import { push_text } from "@graphics/text";
import { A_PRESSED } from "@root/_input/controls";
import { new_node } from "@root/node";
import { switch_scene } from "@root/scene";

export function create_main_menu(root_id: number): number
{
    let id = new_node(root_id, update_main_menu, draw_main_menu);

    return id;
}

function update_main_menu(node_id: number, x: number, y: number, delta: number): void
{
    if (A_PRESSED)
    {
        switch_scene(SCREEN_GAME);
    }
}

function draw_main_menu(node_id: number, x: number, y: number, delta: number): void
{
    push_text("main menu", 0, 0);
}