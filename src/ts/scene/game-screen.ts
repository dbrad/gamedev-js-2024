import { to_abgr_value } from '@graphics/colour';
import { push_quad, push_textured_quad } from '@graphics/quad';
import { DOWN_PRESSED, LEFT_PRESSED, RIGHT_PRESSED, UP_PRESSED, set_key_pulse_time } from '@root/_input/controls';
import { generate_map, get_tile, get_vis, set_vis } from '@root/gameplay/map';
import { new_node } from '@root/node';
import { ceil, easeOutQuad, floor, is_point_in_rect, lerp, min, points_on_circle, points_on_line, rand_int } from 'math';

let player_pos: V2 = [0, 0];
let player_dir: number = DIR_D;
let player_walking: boolean = false;
let player_walking_frame: number = 0;
let player_origin: V2 = [0, 0];
let player_offset: V2 = [0, 0];
let player_target: V2 = [0, 0];
let player_move_lifetime: number = 0;
let player_move_lifetime_remaining: number = 0;
const camera_radius = 11;

let map: LevelMap;
let light_map: number[] = [];
let intesity = 1;
let light_acc = 0;
let update_lighting = (delta: number): void =>
{
    // TODO: Grab other light sources in frame and calc them too.
    // If light pos +- radius is inside of the camera frame, calc it

    light_map.length = 0;

    // light flicker
    light_acc += delta;
    if (light_acc > 250)
    {
        intesity = 1 + rand_int(0, 10) / 100;
        light_acc = 0;
    }

    let circle = points_on_circle(player_pos[X], player_pos[Y], 15);
    for (let c in circle)
    {
        let point_on_circle = circle[c];
        let line = points_on_line(player_pos[X], player_pos[Y], point_on_circle[X], point_on_circle[Y]);
        let line_length = line.length;
        let falloff = intesity / line_length;
        let haw = 0;

        for (let i = 0; i < line_length; i++)
        {
            let pt = line[i];
            if (!is_point_in_rect(pt[X], pt[Y], 0, 0, map.w, map.h)) break;

            let lx = pt[X] - player_pos[X] + camera_radius;
            let ly = pt[Y] - player_pos[Y] + camera_radius;

            if (!is_point_in_rect(lx, ly, 0, 0, 22, 22)) break;

            let strength = falloff * (line_length - i);

            let tile = get_tile(map, pt[X], pt[Y]);
            if (tile === TILE_NONE) { break; }
            if (tile !== TILE_WALL && haw > 0) { break; }

            let idx = lx + ly * 22;
            if (!(idx in light_map) || light_map[idx] > strength)
            {
                set_vis(map, pt[X], pt[Y]);
                light_map[idx] = 1 - (strength > 1 ? 1 : strength);
            }

            if (tile === TILE_VIS_WALL && haw > 1) { break; }
            if (tile === TILE_WALL && haw > 1) { break; }
            if (tile === TILE_WALL) { haw++; }
        }
    }
};

let move_player = (x: number, y: number, duration: number = 100): void =>
{
    // TODO COLLISION CHECK Loot and NPCs
    if (get_tile(map, player_pos[X] + x, player_pos[Y] + y) === TILE_WALL)
        return;

    if (player_move_lifetime_remaining <= 0)
    {
        player_walking = true;

        player_origin[X] = player_pos[X];
        player_origin[Y] = player_pos[Y];

        player_target[X] = player_pos[X] + x;
        player_target[Y] = player_pos[Y] + y;

        player_move_lifetime = duration;
        player_move_lifetime_remaining = duration;
    }
};

let update_player = (delta: number): void =>
{
    if (player_move_lifetime_remaining > 0)
    {
        player_move_lifetime_remaining -= delta;
        if (player_move_lifetime_remaining <= 0)
        {
            player_walking_frame = (player_walking_frame + 1) % 2;
            player_walking = false;
            player_move_lifetime_remaining = 0;
            player_pos[X] = player_target[X];
            player_pos[Y] = player_target[Y];
            player_offset[X] = 0;
            player_offset[Y] = 0;
            return;
        }

        let origin = player_origin;
        let target = player_target;
        let t = player_move_lifetime_remaining / player_move_lifetime;
        t = easeOutQuad(t);

        let fx = lerp(target[X], origin[X], t);
        let fy = lerp(target[Y], origin[Y], t);

        let x: number;
        if (target[X] > origin[X])
            x = floor(fx);
        else
            x = ceil(fx);

        let y: number;
        if (target[Y] > origin[Y])
            y = floor(fy);
        else
            y = ceil(fy);

        let sx = floor((fx - x) * 16);
        let sy = floor((fy - y) * 16);

        player_pos[X] = x;
        player_pos[Y] = y;

        player_offset[X] = sx;
        player_offset[Y] = sy;
    }
};

let draw_player = (): void =>
{
    let t: number = TEXTURE_ROBOT_FRONT_IDLE;
    let flip = false;
    switch (player_dir)
    {
        case DIR_U:
            t = player_walking ? TEXTURE_ROBOT_BACK_STEP : TEXTURE_ROBOT_BACK_IDLE;
            flip = (player_walking && player_walking_frame === 1);
            break;
        case DIR_D:
            t = player_walking ? TEXTURE_ROBOT_FRONT_STEP : TEXTURE_ROBOT_FRONT_IDLE;
            flip = (player_walking && player_walking_frame === 1);
            break;
        case DIR_L:
            flip = true;
        case DIR_R:
            t = !player_walking ? TEXTURE_ROBOT_SIDE_IDLE :
                player_walking_frame === 1 ? TEXTURE_ROBOT_SIDE_STEP_1 : TEXTURE_ROBOT_SIDE_STEP_2;
            break;
    }
    push_textured_quad(t, (camera_radius) * 16 + 136, (camera_radius) * 16, 1, 0xffffcccc, flip, false, !player_walking);
};

////////////////////////////////////////////////////

export let create_game_scene = (root_id: number): number =>
{
    set_key_pulse_time([D_UP, D_DOWN, D_LEFT, D_RIGHT], 100);
    let id = new_node(root_id, update_game_scene, draw_game_scene);

    map = generate_map();

    player_pos[X] = map.s[X];
    player_pos[Y] = map.s[Y];

    update_lighting(0);

    return id;
};

let update_game_scene = (node_id: number, x: number, y: number, delta: number): void =>
{
    update_player(delta);
    update_lighting(delta);

    if (UP_PRESSED)
    {
        player_dir = DIR_U;
        move_player(0, -1);
    }
    else if (DOWN_PRESSED)
    {
        player_dir = DIR_D;
        move_player(0, 1);
    }
    else if (RIGHT_PRESSED)
    {
        player_dir = DIR_R;
        move_player(1, 0);
    }
    else if (LEFT_PRESSED)
    {
        player_dir = DIR_L;
        move_player(-1, 0);
    }
};

let draw_game_scene = (node_id: number, x: number, y: number, delta: number): void =>
{
    let coffx = 136 - player_offset[X];
    let coffy = -player_offset[Y];

    // Render Map
    for (let x = 0; x <= camera_radius * 2; x++)
    {
        for (let y = 0; y <= camera_radius * 2; y++)
        {
            let cx = player_pos[X] - camera_radius + x;
            let cy = player_pos[Y] - camera_radius + y;
            let tile = get_tile(map, cx, cy);
            switch (tile)
            {
                case TILE_WALL:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff000000);
                    break;
                case TILE_FLOOR:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff444444);
                    break;
                case TILE_VIS_WALL:
                    push_textured_quad(TEXTURE_WALL, x * 16 + coffx, y * 16 + coffy);
                    break;
                case TILE_VIS_WALL_CRACKED:
                    push_textured_quad(TEXTURE_WALL_CRACKED, x * 16 + coffx, y * 16 + coffy);
                    break;
                case TILE_VIS_WALL_MOSS:
                    push_textured_quad(TEXTURE_WALL_MOSS, x * 16 + coffx, y * 16 + coffy);
                    break;
                case TILE_DOOR_OPEN:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff44AA44);
                    break;
                case TILE_DOOR_CLOSED:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff4444AA);
                    break;
                case TILE_NONE:
                default:
                    push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, 0xff000000);
            }
        }
    }

    // Player sprite
    draw_player();

    // Light
    for (let x = 0; x <= camera_radius * 2 + 2; x++)
    {
        for (let y = 0; y <= camera_radius * 2; y++)
        {
            let alpha = x > 21 ? 1 : light_map[x + y * 22] ?? 1;
            let color = to_abgr_value(0, 0, 0, alpha * 255);
            push_quad(x * 16 + coffx, y * 16 + coffy, 16, 16, color);
        }
    }

    // Black Bars
    push_quad(0, 0, 152, SCREEN_HEIGHT, 0xff000000);
    push_quad(SCREEN_WIDTH - 152, 0, 152, SCREEN_HEIGHT, 0xff000000);

    push_quad(0, 0, SCREEN_WIDTH, 16, 0xff000000);
    push_quad(0, SCREEN_HEIGHT - 24, SCREEN_WIDTH, 24, 0xff000000);

    // Minimap
    for (let x = 1; x < map.w; x += 3)
    {
        for (let y = 1; y < map.h; y += 3)
        {
            let rx = (x - 1) / 3 * 2;
            let ry = (y - 1) / 3 * 2;
            let rw = map.w / 3 * 2;
            let vis = get_vis(map, x, y);
            if (!vis) continue;

            let tile = get_tile(map, x, y);
            switch (tile)
            {
                case TILE_FLOOR:
                case TILE_VIS_WALL:
                case TILE_VIS_WALL_CRACKED:
                case TILE_VIS_WALL_MOSS:
                    push_quad(SCREEN_WIDTH - rw - 5 + rx, 5 + ry, 1, 1, 0xff666666);
                    break;
                case TILE_DOOR_OPEN:
                    push_quad(SCREEN_WIDTH - rw - 5 + rx, 5 + ry, 1, 1, 0xff66AA66);
                    break;
                case TILE_DOOR_CLOSED:
                    push_quad(SCREEN_WIDTH - rw - 5 + rx, 5 + ry, 1, 1, 0xff6666AA);
                    break;
            }

            if (is_point_in_rect(player_pos[X], player_pos[Y], x - 1, y - 1, 3, 3))
            {
                push_quad(SCREEN_WIDTH - rw - 5 + rx, 5 + ry, 1, 1, 0xffffffff);
            }
        }
    }
};