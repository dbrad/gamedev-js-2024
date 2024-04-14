import { gl } from '@root/_graphics/gl';

let draw_queue: DrawCall[] = [];
let index = 0;

export function init_draw_queue(): void
{
    for (let i = 0; i < 25000; i++)
    {
        draw_queue[i] = {
            x_: 0, y_: 0,
            w_: 0, h_: 0,
            sx_: 1, sy_: 1,
            u0_: 0, v0_: 0, u1_: 0, v1_: 0,
            colour_: 0,
            h_flip_: false, v_flip_: false,
        };
    }
}

export function queue_draw(x: number, y: number, w: number, h: number, sx: number, sy: number, u0: number, v0: number, u1: number, v1: number, colour: number, h_flip: boolean, v_flip: boolean)
{
    let call: DrawCall = draw_queue[index];
    call.x_ = x;
    call.y_ = y;
    call.w_ = w;
    call.h_ = h;
    call.sx_ = sx;
    call.sy_ = sy;
    call.u0_ = u0;
    call.v0_ = v0;
    call.u1_ = u1;
    call.v1_ = v1;
    call.colour_ = colour;
    call.h_flip_ = h_flip;
    call.v_flip_ = v_flip;
    index++;
}

export function clear(): void
{
    index = 0;
}

export function render(): void
{
    gl.clear_();
    for (let i = 0; i < index; i++)
    {
        let call: DrawCall = draw_queue[i];
        let tx: number = 0,
            ty: number = 0;
        if (call.h_flip_)
        {
            tx = -call.w_;
            call.sx_ *= -1;
        }
        if (call.v_flip_)
        {
            ty = -call.h_;
            call.sy_ *= -1;
        }
        gl.push_quad_(
            tx, ty,
            call.w_, call.h_,
            call.x_, call.y_,
            call.sx_, call.sy_,
            call.u0_, call.v0_, call.u1_, call.v1_,
            call.colour_);
    }
    gl.flush_();
}

export function draw_count(): number
{
    return index;
}