type TextureDefinition = [number, number[], number, number, number, number];

type Texture =
    {
        w_: number,
        h_: number,
        u0_: number,
        v0_: number,
        u1_: number,
        v1_: number,
    };

type TextureCache = Texture[];

type DrawCall = {
    x_: number,
    y_: number,
    w_: number,
    h_: number,
    sx_: number,
    sy_: number,
    u0_: number,
    v0_: number,
    u1_: number,
    v1_: number,
    colour_: number,
    h_flip_: boolean,
    v_flip_: boolean,
};