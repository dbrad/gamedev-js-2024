export function is_point_in_rect(x0: number, y0: number, x1: number, y1: number, w: number, h: number): boolean
{
  return x0 >= x1 && x0 < x1 + w && y0 >= y1 && y0 < y1 + h;
};

export function distance_between_points(a: V2, b: V2): number
{
  return math.sqrt((b[X] - a[X]) ** 2 + (b[Y] - a[Y]) ** 2);
}

export function is_point_in_circle(x0: number, y0: number, x1: number, y1: number, radius: number): boolean
{
  return (((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1)) < radius * radius);
};

export function lerp(target: number, origin: number, amount: number): number
{
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return target + (origin - target) * amount;
};

export function easeOutQuad(x: number): number
{
  return 1 - (1 - x) * (1 - x);
};

export function point_on_quadratic_bezier(p0: V2, p1: V2, p2: V2, t: number): V2
{
  return [
    floor((((1 - t) * (1 - t)) * p0[X]) + (2 * (1 - t) * t * p1[X]) + ((t * t) * p2[X])),
    floor((((1 - t) * (1 - t)) * p0[Y]) + (2 * (1 - t) * t * p1[Y]) + ((t * t) * p2[Y]))
  ];
};

export let math = Math;
export let floor = math.floor;
export let ceil = math.ceil;
export let max = math.max;
export let min = math.min;

export function clamp(value: number, min: number, max: number): number
{
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// #region srand
let _srand_seed = 0;
export function srand_seed(seed: number): void
{
  _srand_seed = seed;
};

function srand(): number
{
  _srand_seed = (3967 * _srand_seed + 11) % 16127;
  return _srand_seed / 16127;
};

export function srand_int(min: number, max: number): number
{
  return floor(srand() * (max - min + 1)) + min;
};

export function srand_shuffle<T>(array: T[]): T[]
{
  let current_index: number = array.length, temporary_value: T, random_index: number;
  let arr: T[] = array.slice();
  while (0 !== current_index)
  {
    random_index = floor(srand() * current_index);
    current_index -= 1;
    temporary_value = arr[current_index];
    arr[current_index] = arr[random_index];
    arr[random_index] = temporary_value;
  }
  return arr;
};
// #endregion srand

// #region rand
export function rand_int(min: number, max: number): number
{
  return floor(math.random() * (max - min + 1)) + min;
};

export function rand_shuffle<T>(array: T[]): T[]
{
  let current_index: number = array.length, temporary_value: T, random_index: number;
  let arr: T[] = array.slice();
  while (0 !== current_index)
  {
    random_index = floor(math.random() * current_index);
    current_index -= 1;
    temporary_value = arr[current_index];
    arr[current_index] = arr[random_index];
    arr[random_index] = temporary_value;
  }
  return arr;
};
// #endregion rand