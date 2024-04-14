type RealtiveFn = (node_id: number, x: number, y: number, delta: number) => void;
function null_rel_fn(node_id: number, x: number, y: number, delta: number): void { }
type NodeFn = (node_id: number) => void;
function null_node_fn(node_id: number): void { }

let next_id = 0;

export let node_enabled: boolean[] = [];
export let node_interactive: boolean[] = [];

export let node_position: V2[] = [];
export let node_size: V2[] = [];

let node_parent: number[] = [];
let node_children: number[][] = [];

let node_reset: NodeFn[] = [];
let node_update: RealtiveFn[] = [];
let node_draw: RealtiveFn[] = [];

export function new_node(parent_id: number = -1, update_fn: RealtiveFn = null_rel_fn, draw_fn: RealtiveFn = null_rel_fn, reset_fn: NodeFn = null_node_fn): number
{
    let id = next_id++;

    node_enabled[id] = true;
    node_interactive[id] = true;

    if (parent_id > -1)
    {
        node_parent[id] = parent_id;
        node_children[parent_id].push(id);
    }
    node_children[id] = [];

    node_position[id] = [0, 0];
    node_size[id] = [SCREEN_WIDTH, SCREEN_HEIGHT];

    node_update[id] = update_fn;
    node_draw[id] = draw_fn;
    node_reset[id] = reset_fn;

    return id;
}

export function reset_node(node_id: number): void
{
    let reset_fn = node_reset[node_id];
    if (reset_fn)
        reset_fn(node_id);
}

export function update_node(node_id: number, x: number, y: number, delta: number): void
{
    let update_fn = node_update[node_id];
    let pos = node_position[node_id];
    x += pos[X];
    y += pos[Y];

    update_fn(node_id, x, y, delta);

    for (let child of node_children[node_id])
    {
        update_node(child, x, y, delta);
    }
}

export function draw_node(node_id: number, x: number, y: number, delta: number): void
{
    let render_fn = node_draw[node_id];
    let pos = node_position[node_id];
    x += pos[X];
    y += pos[Y];

    render_fn(node_id, x, y, delta);

    for (let child of node_children[node_id])
    {
        draw_node(child, x, y, delta);
    }
}