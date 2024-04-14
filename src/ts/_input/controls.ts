import { WHITE } from "@graphics/colour";
import { push_textured_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { request_fullscreen } from "@root/screen";
import { floor, is_point_in_circle, is_point_in_rect } from "math";

let hardware_key_state = [0, 0, 0, 0, 0, 0];
let key_state = [0, 0, 0, 0, 0, 0];
let controls_enabled = [0, 0, 0, 0, 0, 0];
let canvas_ref: HTMLCanvasElement;

export let set_controls_used = (...keys: number[]) =>
{
    for (let key = 0; key < 6; key++)
        controls_enabled[key] = 0;

    for (let key of keys)
        controls_enabled[key] = 1;
};

export let UP_PRESSED: boolean = false;
export let DOWN_PRESSED: boolean = false;
export let LEFT_PRESSED: boolean = false;
export let RIGHT_PRESSED: boolean = false;

export let A_PRESSED: boolean = false;
export let B_PRESSED: boolean = false;

let key_map: Record<string, number> = {
    "ArrowLeft": D_LEFT,
    "ArrowUp": D_UP,
    "ArrowRight": D_RIGHT,
    "ArrowDown": D_DOWN,
    "KeyX": A_BUTTON,
    "KeyC": B_BUTTON,
};

let gamepad: Gamepad | null = null;

export let is_touch: boolean = false;
let touches = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

export function is_touch_event(e: Event | PointerEvent | TouchEvent): void 
{
    is_touch = (e.type[0] === "t");
};

function set_touch_position(e: TouchEvent): void 
{
    if (!document.fullscreenElement) request_fullscreen(canvas_ref);

    let canvas_bounds = canvas_ref.getBoundingClientRect();
    is_touch_event(e);
    for (let i = 0; i < 6; i++)
    {
        let touch = e.touches[i];
        if (touch)
        {
            touches[i][0] = floor((touch.clientX - canvas_bounds.left) / (canvas_bounds.width / SCREEN_WIDTH));
            touches[i][1] = floor((touch.clientY - canvas_bounds.top) / (canvas_bounds.height / SCREEN_HEIGHT));
        }
        else
        {
            touches[i][0] = 0;
            touches[i][1] = 0;
        }
    }
    e.preventDefault();
};

function is_mapped_key(key: number): key is number 
{
    return (key !== undefined);
};

export function initialize_input(canvas: HTMLCanvasElement): void 
{
    canvas_ref = canvas;

    document.addEventListener("touchmove", set_touch_position);
    canvas_ref.addEventListener("touchstart", set_touch_position);
    canvas_ref.addEventListener("touchend", set_touch_position);
    document.addEventListener("keydown", (e: KeyboardEvent) =>
    {
        let key = key_map[e.code];
        if (is_mapped_key(key))
        {
            e.preventDefault();
            hardware_key_state[key] = KEY_IS_DOWN;
        }
    });
    document.addEventListener("keyup", (e: KeyboardEvent) =>
    {
        let key = key_map[e.code];
        if (is_mapped_key(key))
        {
            e.preventDefault();
            hardware_key_state[key] = KEY_IS_UP;
        }
    });
    window.addEventListener("gamepadconnected", () =>
    {
        gamepad = navigator.getGamepads()[0];
    });
    window.addEventListener("gamepaddisconnected", () =>
    {
        gamepad = null;
    });
};

let dpad_scale = 7;
let dpad_size = 16 * dpad_scale;
let dpad_touch_center = floor(dpad_size / 3);
let [dpad_x, dpad_y] = [20, SCREEN_HEIGHT - dpad_size - 100];

let button_scale = 3;
let button_size = 16 * button_scale;
let half_button_size = button_size / 2;

let [a_button_x, a_button_y] = [SCREEN_WIDTH - button_size - 80, SCREEN_HEIGHT - button_size - 120];
let [b_button_x, b_button_y] = [SCREEN_WIDTH - button_size - 20, SCREEN_HEIGHT - button_size - 140];

export function update_hardware_input(): void 
{
    if (gamepad || is_touch)
    {
        hardware_key_state[A_BUTTON] = KEY_IS_UP;
        hardware_key_state[B_BUTTON] = KEY_IS_UP;
        hardware_key_state[D_UP] = KEY_IS_UP;
        hardware_key_state[D_DOWN] = KEY_IS_UP;
        hardware_key_state[D_LEFT] = KEY_IS_UP;
        hardware_key_state[D_RIGHT] = KEY_IS_UP;
    }
    if (is_touch)
    {
        for (let i = 0; i < 6; i++)
        {
            let [x, y] = touches[i];

            // D-pad Checks
            if (is_point_in_rect(x, y, dpad_x, dpad_y, dpad_size, dpad_touch_center))
                hardware_key_state[D_UP] = KEY_IS_DOWN;

            if (is_point_in_rect(x, y, dpad_x, dpad_y + dpad_touch_center * 2 + 1, dpad_size, dpad_touch_center))
                hardware_key_state[D_DOWN] = KEY_IS_DOWN;

            if (is_point_in_rect(x, y, dpad_x, dpad_y, dpad_touch_center, dpad_size))
                hardware_key_state[D_LEFT] = KEY_IS_DOWN;

            if (is_point_in_rect(x, y, dpad_x + dpad_touch_center * 2 + 1, dpad_y, dpad_touch_center, dpad_size))
                hardware_key_state[D_RIGHT] = KEY_IS_DOWN;

            // Button Checks
            if (is_point_in_circle(x, y, a_button_x + half_button_size, a_button_y + half_button_size, half_button_size))
                hardware_key_state[A_BUTTON] = KEY_IS_DOWN;

            if (is_point_in_circle(x, y, b_button_x + half_button_size, b_button_y + half_button_size, half_button_size))
                hardware_key_state[B_BUTTON] = KEY_IS_DOWN;
        }
    }
    if (gamepad)
    {
        let buttons = gamepad.buttons;
        let axes = gamepad.axes;

        if (buttons[12].pressed || axes[1] < -0.2)
            hardware_key_state[D_UP] = KEY_IS_DOWN;

        if (buttons[13].pressed || axes[1] > 0.2)
            hardware_key_state[D_DOWN] = KEY_IS_DOWN;

        if (buttons[14].pressed || axes[0] < -0.2)
            hardware_key_state[D_LEFT] = KEY_IS_DOWN;

        if (buttons[15].pressed || axes[0] > 0.2)
            hardware_key_state[D_RIGHT] = KEY_IS_DOWN;

        if (buttons[0].pressed)
            hardware_key_state[A_BUTTON] = KEY_IS_DOWN;

        if (buttons[1].pressed)
            hardware_key_state[B_BUTTON] = KEY_IS_DOWN;
    }
};

let rate_limit: number[] = [0, 0, 0, 0, 0, 0];
let PRESSED: number[] = [];

export function update_input_state(delta: number): void 
{
    for (let key = 0; key <= 5; key++) 
    {
        if (rate_limit[key] > 0)
            rate_limit[key] -= delta;

        if (hardware_key_state[key] === KEY_IS_DOWN)
        {
            if (key_state[key] === KEY_IS_UP)
            {
                PRESSED.push(key);
            }
            key_state[key] = KEY_IS_DOWN;

            if (interval_durations[key] > 0)
            {
                interval_timers[key] += delta;
                if (interval_timers[key] >= interval_durations[key])
                {
                    interval_timers[key] = 0;
                    rate_limit[key] = 250;
                    key_state[key] = KEY_WAS_DOWN;
                }
            }
        }
        else // hardware key is up
        {
            interval_timers[key] = 0;
            if (key_state[key] === KEY_IS_DOWN && rate_limit[key] <= 0)
            {
                key_state[key] = KEY_WAS_DOWN;
                rate_limit[key] = 250;
            }
            else
            {
                key_state[key] = KEY_IS_UP;
                rate_limit[key] = 0;
            }
        }
    }

    UP_PRESSED = key_state[D_UP] === KEY_WAS_DOWN;
    DOWN_PRESSED = key_state[D_DOWN] === KEY_WAS_DOWN;
    LEFT_PRESSED = key_state[D_LEFT] === KEY_WAS_DOWN;
    RIGHT_PRESSED = key_state[D_RIGHT] === KEY_WAS_DOWN;

    A_PRESSED = key_state[A_BUTTON] === KEY_WAS_DOWN;
    B_PRESSED = key_state[B_BUTTON] === KEY_WAS_DOWN;
};

let get_button_texture = (key: number, base_texture: number): number => key_state[key] === KEY_IS_UP ? base_texture : base_texture + 2;
export function render_controls(): void 
{
    let help_text = "";
    if (true)
    {
        push_textured_quad(TEXTURE_D_PAD, dpad_x, dpad_y, dpad_scale, WHITE);

        if (key_state[D_UP] !== KEY_IS_UP)
            push_textured_quad(TEXTURE_D_PAD_UP, dpad_x, dpad_y, dpad_scale, WHITE);

        if (key_state[D_DOWN] !== KEY_IS_UP)
            push_textured_quad(TEXTURE_D_PAD_DOWN, dpad_x, dpad_y, dpad_scale, WHITE);

        if (key_state[D_LEFT] !== KEY_IS_UP)
            push_textured_quad(TEXTURE_D_PAD_LEFT, dpad_x, dpad_y, dpad_scale, WHITE);

        if (key_state[D_RIGHT] !== KEY_IS_UP)
            push_textured_quad(TEXTURE_D_PAD_RIGHT, dpad_x, dpad_y, dpad_scale, WHITE);

        push_textured_quad(get_button_texture(B_BUTTON, TEXTURE_B_BUTTON_UP), b_button_x, b_button_y, button_scale, WHITE);
        push_textured_quad(get_button_texture(A_BUTTON, TEXTURE_A_BUTTON_UP), a_button_x, a_button_y, button_scale, WHITE);
    }

    if (!gamepad && !is_touch)
    {
        help_text = "arrow keys / x. action / c. cancel";
    }
    else
    {
        help_text = "dpad / a. action / b. cancel";
    }

    push_text(help_text, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 8, 0x66ffffff, 1, TEXT_ALIGN_CENTER);
};

let interval_timers: number[] = [0, 0, 0, 0, 0, 0];
let interval_durations: number[] = [0, 0, 0, 0, 0, 0];
export function set_key_pulse_time(keys: number[], interval_duration: number): void 
{
    for (let key of keys)
    {
        interval_timers[key] = 0;
        interval_durations[key] = interval_duration;
    }
};

export function clear_input(): void 
{
    for (let key = 0; key <= 5; key++) 
    {
        interval_timers[key] = 0;
        interval_durations[key] = 0;
        hardware_key_state[key] = KEY_IS_UP;
        key_state[key] = KEY_IS_UP;
    }
    UP_PRESSED = false;
    DOWN_PRESSED = false;
    LEFT_PRESSED = false;
    RIGHT_PRESSED = false;
    A_PRESSED = false;
    B_PRESSED = false;
};