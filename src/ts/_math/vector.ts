// V2
export function copy_V2(source: V2): V2 
{
  return [source[X], source[Y]];
};

export function set_V2(target: V2, x: number, y: number): void 
{
  target[X] = x;
  target[Y] = y;
};

export function set_V2_from_V2(target: V2, source: V2): void 
{
  target[X] = source[X];
  target[Y] = source[Y];
};

export function add_V2(a: V2, b: V2): V2 
{
  return [a[X] + b[X], a[Y] + b[Y]];
};

export function scale_V2(a: V2, f: number): V2 
{
  return [a[X] * f, a[Y] * f];
};

export function sub_V2(a: V2, b: V2): V2 
{
  return [a[X] - b[X], a[Y] - b[Y]];
};
