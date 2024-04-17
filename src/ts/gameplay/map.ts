import { distance_to } from "@math/rect";
import { add_V2, copy_V2, scale_V2 } from "@math/vector";
import { distance_between_points, floor, is_point_in_rect, srand_int, srand_shuffle, srand_seed, rand_int } from "math";

export let get_tile = (map: LevelMap, x: number, y: number): number =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return 0;
    }
    return map.m[x + y * map.w];
};

export let set_tile = (map: LevelMap, x: number, y: number, tile: number): void =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return;
    }
    map.m[x + y * map.w] = tile;
};

export let get_vis = (map: LevelMap, x: number, y: number): boolean =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return false;
    }
    return map.v[x + y * map.w];
};

export let set_vis = (map: LevelMap, x: number, y: number): void =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return;
    }
    map.v[x + y * map.w] = true;
};

export let get_obj = (map: LevelMap, x: number, y: number): MapObject =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return [-1, -1];
    }
    return map.o[x + y * map.w];
};

export let set_obj = (map: LevelMap, x: number, y: number, type: number): void =>
{
    if (x < 0 || y < 0 || x >= map.w || y >= map.h)
    {
        return;
    }
    map.o[x + y * map.w] = [type, 0];
};

export let home_base = (): LevelMap =>
{
    let map = generate_map(15, 0);
    map.v.fill(true);
    map.o = [];
    map.s[X] = 11;
    map.s[Y] = 24;
    return map;
};

const n: V2 = [0, -1];
const e: V2 = [1, 0];
const s: V2 = [0, 1];
const w: V2 = [-1, 0];
const all_directions = [n, e, s, w];

export let generate_map = (map_size: number = 61, seed: number = -1): LevelMap =>
{
    if (seed === -1)
        seed = rand_int(0, 1000000);
    srand_seed(seed);
    let map: LevelMap = {
        w: map_size,
        h: map_size,
        m: new Array<number>(map_size * map_size).fill(TILE_WALL),
        v: [],
        s: [0, 0],
        o: [],
    };
    let num_room_tries: number = 1000;
    let extra_connector_chance: number = 10;
    let room_extra_size: number = 0;
    let winding_percent: number = 10;

    let all_rooms: Rect[] = [];
    let region_map: number[] = [];
    let current_region: number = -1;

    let can_carve = (pos: V2, direction: V2): boolean =>
    {
        let pt = add_V2(pos, scale_V2(direction, 3));
        if (!is_point_in_rect(pt[X], pt[Y], 0, 0, map.w, map.h)) return false;
        pt = add_V2(pos, scale_V2(direction, 2));
        return get_tile(map, pt[X], pt[Y]) === TILE_WALL;
    };

    let new_region = (): void =>
    {
        current_region++;
    };

    let carve = (pos: V2, type: number = TILE_FLOOR) =>
    {
        set_tile(map, pos[X], pos[Y], type);
        region_map[pos[X] + pos[Y] * map.w] = current_region;
    };

    let add_junction = (pos: V2) =>
    {
        if (srand_int(0, 3) === 0)
        {
            set_tile(map, pos[X], pos[Y], TILE_DOOR_CLOSED);
        }
        else
        {
            set_tile(map, pos[X], pos[Y], srand_int(0, 3) === 0 ? TILE_DOOR_OPEN : TILE_FLOOR);
        }
    };

    let fill_maze = (start: V2) =>
    {
        let cells: V2[] = [];
        let last_dir: V2 | null = null;

        new_region();
        carve(start);
        cells.push(start);

        while (cells.length > 0)
        {
            let cell = cells[cells.length - 1];
            let unmade_cells: V2[] = [];

            for (let dir of all_directions)
            {
                if (can_carve(cell, dir)) unmade_cells.push(copy_V2(dir));
            }

            if (unmade_cells.length > 0)
            {
                let dir: V2;
                if (last_dir
                    && unmade_cells.findIndex(c => c[0] == last_dir!![0] && c[1] == last_dir!![1]) !== -1
                    && srand_int(0, 100) > winding_percent)
                {
                    dir = copy_V2(last_dir);
                }
                else
                {
                    unmade_cells = srand_shuffle(unmade_cells);
                    dir = unmade_cells[srand_int(0, unmade_cells.length - 1)];
                }

                carve(add_V2(cell, dir));
                carve(add_V2(cell, scale_V2(dir, 2)));

                cells.push(add_V2(cell, scale_V2(dir, 2)));
                last_dir = copy_V2(dir);
            }
            else
            {
                cells.pop();
                last_dir = null;
            }
        }
    };

    // Make Rooms
    rooms_loop: for (let i = 0; i < num_room_tries; i++)
    {
        let size = srand_int(1, 3 + room_extra_size) * 2 + 1;
        let rectangularity = srand_int(0, 1 + floor(size / 2)) * 2;
        let width = size;
        let height = size;
        if (srand_int(0, 10) <= 5)
            width += rectangularity;
        else
            height += rectangularity;

        let x = srand_int(0, floor((map.w - 1 - width) / 2)) * 2 + 1;
        let y = srand_int(0, floor((map.h - 1 - height) / 2)) * 2 + 1;

        let room: Rect = [x, y, width, height];
        for (let other of all_rooms)
        {
            if (distance_to(room, other) <= 0)
            {
                continue rooms_loop;
            }
        }

        all_rooms.push(room);
        map.s[X] = srand_int(x + 1, x + width - 1);
        map.s[Y] = srand_int(y + 1, y + height - 1);

        new_region();
        for (let rx = x; rx < x + width; rx++)
        {
            for (let ry = y; ry < y + height; ry++)
            {
                carve([rx, ry]);
            }
        }
    }

    // Fill Maze
    for (let y = 1; y < map.h; y += 2)
    {
        for (let x = 1; x < map.w; x += 2)
        {
            if (get_tile(map, x, y) !== TILE_WALL) continue;
            fill_maze([x, y]);
        }
    }

    // Connect Regions
    let connectors: V2[] = [];
    let connector_regions: Map<number, Set<number>> = new Map();
    for (let x = 1; x < map.w - 1; x++)
    {
        for (let y = 1; y < map.h - 1; y++)
        {
            let pos: V2 = [x, y];

            if (get_tile(map, x, y) !== TILE_WALL) continue;

            let regions = new Set<number>();
            for (let dir of all_directions)
            {
                let pt = add_V2(pos, dir);
                let region = region_map[pt[X] + pt[Y] * map.w];
                if (region !== undefined) regions.add(region);
            }

            if (regions.size < 2) continue;

            connector_regions.set(x + y * map.w, regions);
            connectors.push(pos);
        }
    }

    let merged: number[] = [];
    let open_regions = new Set<number>();
    for (let i = 0; i <= current_region; i++)
    {
        merged[i] = i;
        open_regions.add(i);
    }

    while (open_regions.size > 1)
    {
        let connector = connectors[srand_int(0, connectors.length - 1)];

        add_junction(connector);

        let idx = connector[X] + connector[Y] * map.w;
        let regions = [...connector_regions.get(idx)!!.values()].map((region) => merged[region]);
        let dest = regions[0];
        let sources = regions.slice(1);

        for (let i = 0; i <= current_region; i++)
        {
            if (sources.indexOf(merged[i]) > -1)
            {
                merged[i] = dest;
            }
        }

        sources.forEach(i => open_regions.delete(i));

        let allow_extra = true; // We'll allow only 1 extra per pass, to prevent double wide doors.
        connectors = connectors.filter((pos) =>
        {
            if (distance_between_points(connector, pos) <= 2) return false;

            let idx = pos[X] + pos[Y] * map.w;
            let regions = new Set([...connector_regions.get(idx)!!.values()].map((region) => merged[region]));
            if (regions.size > 1) return true;

            if (allow_extra && srand_int(0, extra_connector_chance) === 0)
            {
                allow_extra = false;
                add_junction(pos);
            }
            return false;
        });
    }

    // Remove deadends
    let done = false;
    while (!done)
    {
        done = true;

        for (let x = 1; x < map.w - 1; x++)
        {
            for (let y = 1; y < map.h - 1; y++)
            {
                let pos: V2 = [x, y];
                if (get_tile(map, x, y) === TILE_WALL) continue;

                let exits = 0;
                for (let dir of all_directions)
                {
                    let pt = add_V2(pos, dir);
                    if (get_tile(map, pt[X], pt[Y]) !== TILE_WALL) exits++;
                }

                if (exits != 1) continue;

                done = false;
                set_tile(map, x, y, TILE_WALL);
            }
        }
    };

    //Expand Map
    const expansion_factor = 2;
    let final_map: LevelMap = {
        w: map.w * expansion_factor,
        h: map.h * expansion_factor,
        m: new Array<number>((map.w * expansion_factor) * (map.h * expansion_factor)).fill(TILE_WALL),
        v: new Array<boolean>((map.w * expansion_factor) * (map.h * expansion_factor)).fill(false),
        s: scale_V2(map.s, expansion_factor),
        o: [],
    };

    for (let x = 0; x < map.w; x++)
    {
        for (let y = 0; y < map.h; y++)
        {
            let ex = x * expansion_factor;
            let ey = y * expansion_factor;
            let tile = get_tile(map, x, y);
            for (let ox = 0; ox < expansion_factor; ox++)
            {
                for (let oy = 0; oy < expansion_factor; oy++)
                {
                    set_tile(final_map, ex + ox, ey + oy, tile);
                }
            }
            switch (tile)
            {
                case TILE_WALL:
                    let down_tile = get_tile(map, x, y + 1);
                    if (down_tile === TILE_FLOOR || down_tile === TILE_DOOR_OPEN || down_tile === TILE_DOOR_CLOSED)
                    {
                        for (let ox = 0; ox < expansion_factor; ox++)
                        {
                            set_tile(final_map, ex + ox, ey + 1, srand_int(0, 4) === 0 ? srand_int(0, 4) === 0 ? TILE_VIS_WALL_MOSS : TILE_VIS_WALL_CRACKED : TILE_VIS_WALL);
                        }
                    }
                    break;
                // case TILE_DOOR_OPEN:
                // case TILE_DOOR_CLOSED:
                // case TILE_FLOOR:
                //     let up_tile = get_tile(map, x, y - 1);
                //     if (up_tile === TILE_WALL)
                //     {
                //         for (let ox = 0; ox < expansion_factor; ox++)
                //         {
                //             set_tile(final_map, ex + ox, ey, srand_int(0, 4) === 0 ? srand_int(0, 4) === 0 ? TILE_VIS_WALL_MOSS : TILE_VIS_WALL_CRACKED : TILE_VIS_WALL);
                //         }
                //     }
                //     break;
            }
        }
    }

    // Decorate
    for (let x = 0; x < final_map.w; x++)
    {
        for (let y = 0; y < final_map.h; y++)
        {
            let tile = get_tile(final_map, x, y);
            switch (tile)
            {
                case TILE_DOOR_OPEN:
                case TILE_DOOR_CLOSED:
                    // Add doors
                    // Add door switch
                    break;
                case TILE_VIS_WALL:
                case TILE_VIS_WALL_CRACKED:
                case TILE_VIS_WALL_MOSS:
                    // Chance to add vending machines and other back wall specific objects
                    break;
                case TILE_FLOOR:
                    if (srand_int(0, 20) === 0) set_obj(final_map, x, y, 0);
                    // Chance to add floor stuff
                    break;
            }
        }
    }

    return final_map;
};
