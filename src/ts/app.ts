import { debug } from "@debug";
import { clear, draw_count, init_draw_queue, render } from "@root/_graphics/draw";
import { gl } from "@root/_graphics/gl";
import { init_particles } from "@root/_graphics/particle";
import { load_textures } from "@root/_graphics/texture";

import { WHITE } from "@graphics/colour";
import { push_text } from "@graphics/text";
import { initialize_input, is_touch_event, render_controls, update_hardware_input, update_input_state } from "./_input/controls";
import { new_node } from "./node";
import { draw_scene, register_scene, update_scene } from "./scene";
import { create_game_scene } from "./scene/game-screen";
import { create_main_menu } from "./scene/main-menu";
import { create_splash_screen } from "./scene/splash-screen";
import { init_canvas } from "./screen";

window.addEventListener("load", async () =>
{
    let canvas = init_canvas();
    gl.initialize_(canvas);
    await load_textures();
    gl.set_clear_colour_(0.0, 0.0, 0.0);

    debug.init_performance_meter();
    init_draw_queue();
    init_particles();

    let playing = false;
    let initialize_game = (e: PointerEvent | TouchEvent) =>
    {
        if (!playing)
        {
            initialize_input(canvas);
            is_touch_event(e);
            canvas.removeEventListener("touchstart", initialize_game);
            canvas.removeEventListener("pointerdown", initialize_game);
            playing = true;
            const root = new_node();
            const splash_screen = create_splash_screen(root);
            register_scene(SCREEN_INIT, splash_screen);

            const main_menu = create_main_menu(root);
            register_scene(SCREEN_MENU, main_menu);

            const game_scene = create_game_scene(root);
            register_scene(SCREEN_GAME, game_scene);

            if (DEBUG)
            {
                document.addEventListener("keyup", (e: KeyboardEvent) =>
                {
                    if (e.code === "KeyD") debug.toggle_performance_display();
                });
            }
        }
    };

    canvas.addEventListener("touchstart", initialize_game);
    canvas.addEventListener("pointerdown", initialize_game);

    let target_update_ms: number = 16.65,
        then: number = performance.now(),
        acc_delta: number = 0;

    function tick(now: number)
    {
        requestAnimationFrame(tick);
        if (playing)
        {
            debug.performance_mark("start_of_frame");
            let frame_delta = now - then;
            then = now;
            acc_delta += frame_delta;
            let draw_calls = 0;

            if (acc_delta >= target_update_ms)
            {
                if (acc_delta > 250)
                    acc_delta = target_update_ms;
                clear();
                debug.performance_mark("update_start");
                {
                    update_hardware_input();
                    update_input_state(acc_delta);
                    update_scene(acc_delta);
                }
                debug.performance_mark("update_end");

                debug.performance_mark("draw_start");
                {
                    draw_scene(acc_delta);
                    render_controls();
                    if (DEBUG)
                        draw_calls = draw_count();

                    debug.draw_performance_meter();
                    acc_delta = 0;
                }
                debug.performance_mark("draw_end");

                debug.performance_mark("render_start");
                {
                    render();
                }
                debug.performance_mark("render_end");
            }
            debug.tick_performance_meter(frame_delta, draw_calls);
        }
        else
        {
            clear();
            push_text("tap to start", SCREEN_CENTER_X, SCREEN_CENTER_Y, WHITE, 2, TEXT_ALIGN_CENTER);
            render();
        }
    }

    requestAnimationFrame(tick);
});