import { to_abgr_value } from "@root/_graphics/colour";
import { clear_particles, draw_particles, update_particles } from "@root/_graphics/particle";
import { push_quad } from "@root/_graphics/quad";

import { update_idle_animation_frame } from "@graphics/animation";

let current_scene: number = SCREEN_INIT,
    on_transition: boolean = true,
    trans_fade_out: boolean = true,
    trans_from_scene: number = SCREEN_UNKNOWN,
    trans_to_scene: number = SCREEN_UNKNOWN,
    trans_alpha: number = 255,
    transition_rate: number = 510,
    scenes: Scene[] = [];

export let register_scene = (scene_id: number, reset_fn: VoidFunction, update_fn: TimedFunction, render_fn: TimedFunction): void =>
{
    scenes[scene_id] = [reset_fn, update_fn, render_fn];
};

export let switch_scene = (scene_id: number) =>
{
    on_transition = true;
    trans_fade_out = false;
    trans_from_scene = current_scene;
    trans_to_scene = scene_id;
    trans_alpha = 0;
};

let update_transition = (delta: number): void =>
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
            scenes[current_scene][0]();
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
};

export let update_scene = (delta: number) =>
{
    update_idle_animation_frame(delta);
    if (!on_transition)
    {
        update_particles(delta);
        scenes[current_scene][1](delta);
    }
    else
    {
        update_transition(delta);
    }
};

export let draw_scene = (delta: number) =>
{
    scenes[current_scene][2](delta);
    draw_particles(delta);
    if (on_transition)
    {
        push_quad(152, 8, 336, 336, to_abgr_value(0, 0, 0, trans_alpha));
    }
};