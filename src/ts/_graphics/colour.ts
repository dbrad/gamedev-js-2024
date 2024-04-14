import { clamp } from "@root/_math/math";

export function to_abgr_value(r: number, g: number, b: number, a: number): number
{
  let out = (0 | (clamp(a, 0, 255) & 0xff)) << 8 >>> 0;
  out = (out | (clamp(b, 0, 255) & 0xff)) << 8 >>> 0;
  out = (out | (clamp(g, 0, 255) & 0xff)) << 8 >>> 0;
  out = (out | (clamp(r, 0, 255) & 0xff)) >>> 0;
  return out;
};

export function set_v4_to_colour(v: V4, c: number): void
{
  c >>>= 0;
  v[R] = c & 0xff;
  v[G] = (c & 0xff00) >>> 8;
  v[B] = (c & 0xff0000) >>> 16;
  v[A] = ((c & 0xff000000) >>> 24);
}

export let WHITE: number = 0xffffffff;
export let BLACK: number = 0xff000000;
export let OFF_WHITE: number = 0xfff6f6f6;
export let OFF_BLACK: number = 0xff2d2d2d;