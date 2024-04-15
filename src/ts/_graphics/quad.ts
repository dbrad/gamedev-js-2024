import { TEXTURE_CACHE } from "@root/_graphics/texture";
import { queue_draw } from "./draw";
import { idle_frame } from "./animation";

export let push_quad = (x: number, y: number, w: number, h: number, colour: number): void =>
{
  queue_draw(x, y, w, h, 1, 1, 2, 2, 2, 2, colour, false, false);
};

export let push_textured_quad = (texture_id: number, x: number, y: number, scale: number = 1, colour: number = 0xffffffff, h_flip: boolean = false, v_flip: boolean = false, idle_animation: boolean = false): void =>
{
  let t = TEXTURE_CACHE[texture_id];
  queue_draw(
    x, y + (idle_animation ? idle_frame : 0),
    t.w_, t.h_ - (idle_animation ? idle_frame : 0),
    scale, scale,
    t.u0_, t.v0_, t.u1_, t.v1_ - (idle_animation ? idle_frame * (1 / ATLAS_HEIGHT) : 0),
    colour,
    h_flip, v_flip
  );
};
