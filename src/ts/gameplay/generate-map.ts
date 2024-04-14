import { debug } from "@debug";
import { distance_to } from "@math/rect";
import { add_V2, copy_V2, scale_V2 } from "@math/vector";
import { distance_between_points, floor, is_point_in_rect, rand_int, rand_shuffle } from "math";

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

const TILE_WALL = 1;
const TILE_FLOOR = 2;

const n: V2 = [0, -1];
const e: V2 = [1, 0];
const s: V2 = [0, 1];
const w: V2 = [-1, 0];
const all_directions = [n, e, s, w];

export let generate_map = (): LevelMap =>
{
    let map: LevelMap = {
        w: 63,
        h: 63,
        m: new Array<number>(63 * 63).fill(TILE_WALL)
    };

    let numRoomTries: number = 1000;
    let extraConnectorChance: number = 20;
    let roomExtraSize: number = 1;
    let winding_percent: number = 10;

    let all_rooms: Rect[] = [];
    let region_map: number[] = [];
    let current_region: number = -1;

    let can_carve = (pos: V2, direction: V2): boolean =>
    {
        let pt = add_V2(pos, scale_V2(direction, 3));
        if (!is_point_in_rect(pt[X], pt[Y], 0, 0, map.w, map.h)) return false;
        pt = add_V2(pos, scale_V2(direction, 2));
        return get_tile(map, pt[X], pt[Y]) == TILE_WALL;
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
        if (rand_int(0, 3) === 0)
        {
            set_tile(map, pos[X], pos[Y], TILE_FLOOR); // TODO DOORS
        }
        else
        {
            set_tile(map, pos[X], pos[Y], TILE_FLOOR); // TODO DOORS
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
                    && rand_int(0, 100) > winding_percent)
                {
                    dir = copy_V2(last_dir);
                }
                else
                {
                    unmade_cells = rand_shuffle(unmade_cells);
                    dir = unmade_cells[rand_int(0, unmade_cells.length - 1)];
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
    roomsLoop: for (let i = 0; i < numRoomTries; i++)
    {
        let size = rand_int(1, 3 + roomExtraSize) * 2 + 1;
        let rectangularity = rand_int(0, 1 + floor(size / 2)) * 2;
        let width = size;
        let height = size;
        if (rand_int(0, 10) <= 5)
            width += rectangularity;
        else
            height += rectangularity;

        let x = rand_int(0, floor((map.w - 1 - width) / 2)) * 2 + 1;
        let y = rand_int(0, floor((map.h - 1 - height) / 2)) * 2 + 1;

        let room: Rect = [x, y, width, height];
        for (let other of all_rooms)
        {
            if (distance_to(room, other) <= 0)
            {
                continue roomsLoop;
            }
        }

        all_rooms.push(room);

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
    let connectorRegions: Map<number, Set<number>> = new Map();
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

            connectorRegions.set(x + y * map.w, regions);
            connectors.push(pos);
        }
    }

    let merged: number[] = [];
    let openRegions = new Set<number>();
    for (let i = 0; i <= current_region; i++)
    {
        merged[i] = i;
        openRegions.add(i);
    }

    while (openRegions.size > 1)
    {
        let connector = connectors[rand_int(0, connectors.length - 1)];
        debug.assert(connector !== undefined, `no connector found. ${connectors.length} open regions: ${openRegions.size}`);

        add_junction(connector);

        let idx = connector[X] + connector[Y] * map.w;
        let regions = [...connectorRegions.get(idx)!!.values()].map((region) => merged[region]);
        let dest = regions[0];
        let sources = regions.slice(1);

        for (let i = 0; i <= current_region; i++)
        {
            if (sources.indexOf(merged[i]) > -1)
            {
                merged[i] = dest;
            }
        }

        sources.forEach(i => openRegions.delete(i));

        connectors = connectors.filter((pos) =>
        {
            if (distance_between_points(connector, pos) < 2) return false;

            let idx = pos[X] + pos[Y] * map.w;
            let regions = new Set([...connectorRegions.get(idx)!!.values()]
                .map((region) => merged[region]));
            if (regions.size > 1) return true;

            if (rand_int(0, extraConnectorChance) === 0) add_junction(pos);

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

    return map;
};
