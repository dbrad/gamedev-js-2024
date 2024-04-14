export let distance_to = (a: Rect, b: Rect): number =>
{
    let vertical: number = -1;
    if (a[Y] >= b[Y] + b[3])
        vertical = a[Y] - b[Y] + b[3];
    else if (a[Y] + a[3] <= b[Y])
        vertical = b[Y] - a[Y] + a[3];

    let horizontal: number = -1;
    if (a[X] >= b[X] + b[2])
        horizontal = a[X] - b[X] + b[2];
    else if (a[X] + a[2] <= b[X])
        horizontal = b[X] - a[X] + a[2];

    if (vertical === -1 && horizontal == -1) return -1;
    if (vertical === -1) return horizontal;
    if (horizontal === -1) return vertical;
    return horizontal + vertical;
};