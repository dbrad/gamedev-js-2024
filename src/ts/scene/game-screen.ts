import { push_quad } from '@graphics/quad';
import { DOWN_PRESSED, LEFT_PRESSED, RIGHT_PRESSED, UP_PRESSED, set_key_pulse_time } from '@root/_input/controls';
import { generate_map, get_tile } from '@root/gameplay/generate-map';
import { new_node } from '@root/node';

let camera_look_at: V2 = [0, 0];
let camera_origin: V2 = [0, 0];
let camera_offset: V2 = [0, 0];
let camera_target: V2 = [0, 0];
let camera_lifetime: number = 0;
let camera_lifetime_remaining: number = 0;
const camera_radius = 11;
const sim_radius = 16;

let map: LevelMap;

//////

export function create_game_scene(root_id: number): number
{
    set_key_pulse_time([D_UP, D_DOWN, D_LEFT, D_RIGHT], 100);
    let id = new_node(root_id, update_game_scene, draw_game_scene);

    map = generate_map();

    return id;
}

function update_game_scene(node_id: number, x: number, y: number, delta: number): void
{
    if (UP_PRESSED)
        camera_look_at[Y] -= 1;
    else if (DOWN_PRESSED)
        camera_look_at[Y] += 1;
    else if (RIGHT_PRESSED)
        camera_look_at[X] += 1;
    else if (LEFT_PRESSED)
        camera_look_at[X] -= 1;
}

function draw_game_scene(node_id: number, x: number, y: number, delta: number): void
{
    let coffx = 136 - camera_offset[X];
    let coffy = -camera_offset[Y];

    for (let x = 0; x <= camera_radius * 2; x++)
    {
        for (let y = 0; y <= camera_radius * 2; y++)
        {
            let cx = camera_look_at[X] - camera_radius + x;
            let cy = camera_look_at[Y] - camera_radius + y;
            let tile = get_tile(map, cx, cy);
            switch (tile)
            {
                case 1:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff111111);
                    break;
                case 2:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff666666);
                    break;
                case 0:
                default:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff000000);

            }
        }
    }

    push_quad(0, 0, 152, SCREEN_HEIGHT, 0xff000000);
    push_quad(SCREEN_WIDTH - 152, 0, 152, SCREEN_HEIGHT, 0xff000000);

    push_quad(0, 0, SCREEN_WIDTH, 16, 0xff000000);
    push_quad(0, SCREEN_HEIGHT - 24, SCREEN_WIDTH, 24, 0xff000000);
}