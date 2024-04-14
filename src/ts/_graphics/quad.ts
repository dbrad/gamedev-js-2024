import { TEXTURE_CACHE } from "@root/_graphics/texture";
import { queue_draw } from "./draw";

export function push_quad(x: number, y: number, w: number, h: number, colour: number): void 
{
  queue_draw(x, y, w, h, 1, 1, 2, 2, 2, 2, colour, false, false);
};

export function push_textured_quad(texture_id: number, x: number, y: number, scale: number = 1, colour: number = 0xffffffff, h_flip: boolean = false, v_flip: boolean = false): void 
{
  let t = TEXTURE_CACHE[texture_id];
  queue_draw(
    x, y,
    t.w_, t.h_,
    scale, scale,
    t.u0_, t.v0_, t.u1_, t.v1_,
    colour,
    h_flip, v_flip
  );
};
