import { to_abgr_value } from "@root/_graphics/colour";
import { clear_particles, draw_particles, update_particles } from "@root/_graphics/particle";
import { push_quad } from "@root/_graphics/quad";

import { draw_node, reset_node, update_node } from "./node";

let current_scene: number = SCREEN_INIT,
    on_transition: boolean = true,
    trans_fade_out: boolean = true,
    trans_from_scene: number = SCREEN_UNKNOWN,
    trans_to_scene: number = SCREEN_UNKNOWN,
    trans_alpha: number = 255,
    transition_rate: number = 510,
    scenes: number[] = [];

export function register_scene(scene_id: number, root_id: number): void
{
    scenes[scene_id] = root_id;
}

export function switch_scene(scene_id: number)
{
    on_transition = true;
    trans_fade_out = false;
    trans_from_scene = current_scene;
    trans_to_scene = scene_id;
    trans_alpha = 0;
}

function update_transition(delta: number): void
{
    let ds = delta / 1000;
    if (!trans_fade_out)
    {
        trans_alpha += ds * transition_rate;
        if (trans_alpha > 255)
        {
            trans_alpha = 255;
            clear_particles();
            current_scene = trans_to_scene;
            reset_node(current_scene);
            trans_fade_out = true;
        }
    }
    else
    {
        trans_alpha -= ds * transition_rate;
        if (trans_alpha < 0)
        {
            trans_alpha = 0;
            trans_fade_out = false;
            on_transition = false;
            trans_from_scene = SCREEN_UNKNOWN;
            trans_to_scene = SCREEN_UNKNOWN;
        }
    }
}

export function update_scene(delta: number)
{
    if (!on_transition)
    {
        update_particles(delta);
        update_node(scenes[current_scene], 0, 0, delta);
    }
    else
    {
        update_transition(delta);
    }
}

export function draw_scene(delta: number)
{
    draw_node(scenes[current_scene], 0, 0, delta);
    draw_particles(delta);
    if (on_transition)
    {
        push_quad(152, 8, 336, 336, to_abgr_value(0, 0, 0, trans_alpha));
    }
}