import { BLACK, WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { zzfx } from "@root/_audio/zzfx";
import { A_PRESSED, DOWN_PRESSED, UP_PRESSED } from "@root/_input/controls";
import { max, min } from "math";

export let dialog_pending: boolean = false;
let dialog_queue: Dialog[] = [];

let has_dialog: boolean = false;
let dialog_done: boolean = false;
let show_continue: boolean = false;
let target_dialog_text: string = "";
let current_dialog_text: string = "";
let current_dialog_text_index: number = 0;
let dialog_timer: number = 0;
let grace_period: boolean = false;
let letter_rate = 32;
let talk_sound_play: number = 0;

let current_choice: Choice | undefined;
let choice_count: number = 0;
let choice_index: number = 0;

export let push_dialog = (text: string, choice?: Choice): void =>
{
    dialog_queue.push([text, choice]);
    dialog_pending = true;
};

export let update_dialog = (delta: number): void =>
{
    if (dialog_pending && !has_dialog)
    {
        let dialog = dialog_queue.shift();
        if (dialog)
        {
            has_dialog = true;
            dialog_done = false;
            show_continue = false;

            target_dialog_text = dialog[0];
            current_dialog_text = "";
            current_dialog_text_index = 0;
            grace_period = true;
            letter_rate = 32;
            talk_sound_play = 0;

            current_choice = dialog[1];
            if (current_choice)
                choice_count = current_choice[1].length;
            choice_index = 0;
        }
        else
            dialog_pending = false;
    }

    if (has_dialog)
    {
        dialog_timer += delta;
        if (dialog_done)
        {
            if (dialog_timer > 500)
            {
                dialog_timer -= 500;
                grace_period = false;
                show_continue = !show_continue;
            }

            if (current_choice)
            {
                if (UP_PRESSED)
                    choice_index = max(0, choice_index - 1);
                else if (DOWN_PRESSED)
                    choice_index = min(choice_count - 1, choice_count + 1);
            }

            if (A_PRESSED && !grace_period)
            {
                if (current_choice)
                    current_choice[1][choice_index][1]();
                has_dialog = false;
            }
        }
        else
        {
            if (A_PRESSED || B_BUTTON)
                letter_rate = 8;

            if (dialog_timer >= letter_rate)
            {
                dialog_timer -= letter_rate;
                current_dialog_text_index++;
                talk_sound_play = (talk_sound_play + 1) % 5;
                if (talk_sound_play === 0)
                    zzfx(...[, 1, 110, .01, .05, .01, 1, 50, 1, , , , , , , , , .5]);
            }
            current_dialog_text = target_dialog_text.substring(0, current_dialog_text_index);
            dialog_done = current_dialog_text_index >= target_dialog_text.length;
            if (dialog_done)
                current_dialog_text = target_dialog_text;
        }
    }
};

export let draw_dialog = (): void =>
{
    if (has_dialog)
    {
        push_quad(0, SCREEN_HEIGHT - 90, SCREEN_WIDTH, 80, WHITE);
        push_quad(1, SCREEN_HEIGHT - 89, SCREEN_WIDTH - 2, 78, BLACK);
        push_text(current_dialog_text, 1, SCREEN_HEIGHT - 88, WHITE, 2);
        if (show_continue)
            push_text("...", SCREEN_WIDTH - 2, SCREEN_HEIGHT - 30, WHITE, 2, TEXT_ALIGN_RIGHT);

        if (dialog_done && current_choice)
        {
            push_quad(SCREEN_CENTER_X - 160, SCREEN_CENTER_Y - 40, 320, 80, WHITE);
            push_quad(SCREEN_CENTER_X - 159, SCREEN_CENTER_Y - 39, 318, 78, BLACK);
            push_text(current_choice[0], SCREEN_CENTER_X, SCREEN_CENTER_Y - 38, WHITE, 1, TEXT_ALIGN_CENTER);
            for (let i = 0; i < choice_count; i++)
                push_text((i === choice_index ? "> " : "") + current_choice[1][i][0], SCREEN_CENTER_X - 158, SCREEN_CENTER_Y - 6 + 16 * i);
        }
    }
};