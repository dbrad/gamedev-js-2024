import { OFF_WHITE } from "@root/_graphics/colour";
import { push_quad } from "@root/_graphics/quad";
import { push_text } from "@root/_graphics/text";

export namespace debug
{
    let frame_count: number = 0;
    let fps: number = 60;
    let ms: number = 1000 / fps;
    let update_time: number = 0;
    let draw_time: number = 0;
    let render_time: number = 0;

    let average_frame_time: number = 0;
    let average_update_time: number = 0;
    let average_draw_time: number = 0;
    let average_render_time: number = 0;
    let average_draw_count: number = 0;

    let display_ms: string = "";
    let display_frame_time: string = "";
    let display_update_time: string = "";
    let display_draw_time: string = "";
    let display_render_time: string = "";
    let display_draw_count: string = "";

    let next_fps_time: number = 0;
    const FPS_INTERVAL: number = 1000;

    let next_display_time: number = 0;
    const DISPLAY_INTERVAL: number = 100;

    let show_performance: boolean = false;

    export function init_performance_meter(): void
    {
        if (DEBUG)
        {
            show_performance = false;
        }
    };

    export function toggle_performance_display(): void
    {
        if (DEBUG)
        {
            show_performance = !show_performance;
        }
    };

    const background: number = 0xf0000000;
    const col_1: number = SCREEN_WIDTH - 8;
    const col_2: number = SCREEN_WIDTH - 160;

    export function draw_performance_meter(): void
    {
        if (DEBUG)
            if (show_performance)
            {
                push_quad(0, 0, SCREEN_WIDTH, 85, background);

                push_text(`fps ${fps.toFixed(0).padStart(7, " ")} hz`, col_1, 5, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
                push_text(`frame ${display_ms} ms`, col_1, 18, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
                push_text(`actual ${display_frame_time} us`, col_1, 31, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
                push_text(`update ${display_update_time} us`, col_1, 44, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
                push_text(`draw ${display_draw_time} us`, col_1, 57, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
                push_text(`render ${display_render_time} us`, col_1, 70, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);

                push_text(`d ${display_draw_count}`, col_2, 70, OFF_WHITE, 1, TEXT_ALIGN_RIGHT);
            }
    };

    export function tick_performance_meter(delta: number, draw_count: number): void
    {
        if (DEBUG)
        {
            let frame_start_time = performance.getEntriesByName("start_of_frame", "mark")[0].startTime;
            // performance.measure("frame", "start_of_frame");
            // let frame_duration_time = performance.getEntriesByName("frame")[0].duration;

            // MS
            ms = (0.9 * delta) + (0.1 * ms);
            // average_frame_time = (0.9 * frame_duration_time) + (0.1 * average_frame_time);
            // if (average_frame_time < 0) average_frame_time = 0;

            if (ms > 250)
            {
                fps = 0;
                ms = 0;
                average_frame_time = 0;
                average_update_time = 0;
                average_draw_time = 0;
                average_render_time = 0;
                average_draw_count = 0;
            }

            // FPS
            if (frame_start_time >= next_fps_time)
            {
                let last_update_time = next_fps_time - FPS_INTERVAL;
                let current_fps = frame_count * 1000;
                let actual_duration = frame_start_time - last_update_time;
                fps = (0.9 * (current_fps / actual_duration)) + (0.1 * fps);
                frame_count = 0;
                next_fps_time = frame_start_time + FPS_INTERVAL;
            }
            frame_count++;

            // UPDATE + DRAW + RENDER
            if (performance.getEntriesByName("update_start").length > 0)
            {
                performance.measure("update", "update_start", "update_end");
                update_time = performance.getEntriesByName("update")[0].duration;
                if (update_time > 0)
                    average_update_time = (0.9 * update_time) + (0.1 * average_update_time);

                performance.measure("draw", "draw_start", "draw_end");
                draw_time = performance.getEntriesByName("draw")[0].duration;
                if (draw_time > 0)
                    average_draw_time = (0.9 * draw_time) + (0.1 * average_draw_time);

                performance.measure("render", "render_start", "render_end");
                render_time = performance.getEntriesByName("render")[0].duration;
                if (render_time > 0)
                    average_render_time = (0.9 * render_time) + (0.1 * average_render_time);
            }

            let total = average_update_time + average_draw_time + average_render_time;
            average_frame_time = (0.9 * total) + (0.1 * average_frame_time);
            if (draw_count > 0)
                average_draw_count = (0.9 * draw_count) + (0.1 * average_draw_count);

            performance.clearMeasures();
            performance.clearMarks();

            // DISPLAY VALUES
            if (frame_start_time > next_display_time)
            {
                display_ms = ms.toFixed(3).padStart(7, " ");
                display_frame_time = (average_frame_time * 1000).toFixed(0).padStart(7, " ");
                display_update_time = (average_update_time * 1000).toFixed(0).padStart(7, " ");
                display_draw_time = (average_draw_time * 1000).toFixed(0).padStart(7, " ");
                display_render_time = (average_render_time * 1000).toFixed(0).padStart(7, " ");
                display_draw_count = average_draw_count.toFixed(0).padStart(7, " ");

                next_display_time = frame_start_time + DISPLAY_INTERVAL;
            }
        }
    };

    export function performance_mark(markName: string): void
    {
        if (DEBUG)
            performance.mark(markName);
    };

    export function assert(predicate: (() => boolean) | boolean, message: string): asserts predicate
    {
        if (DEBUG)
        {
            if (typeof predicate === "function" ? !predicate() : !predicate)
            {
                throw new Error(message);
            }
        }
    }

    export function debug_log(...data: any[]): void
    {
        if (DEBUG)
            console.log(...data);
    };
}