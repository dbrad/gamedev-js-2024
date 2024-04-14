import { set_V2 } from "@root/_math/vector";
import { floor, lerp, math } from "@root/_math/math";
import { set_v4_to_colour, to_abgr_value } from "./colour";
import { push_quad } from "./quad";

type Particle = {
    position_: V2;
    velocity_: V2;
    size_begin_: number;
    size_end_: number;
    size_: number;
    colour_begin_: V4;
    colour_end_: V4;
    colour_: V4;
    lifetime_: number;
    lifetime_remaining_: number;
};

const MAX_PARTICLES = 10000;

let particles: Particle[] = [];
let pool_index = MAX_PARTICLES - 1;
let active_particles: Set<number> = new Set();

export function init_particles(): void
{
    for (let i = MAX_PARTICLES - 1; i >= 0; --i)
    {
        particles[i] = {
            position_: [0, 0],
            velocity_: [0, 0],
            size_begin_: 0,
            size_end_: 0,
            size_: 0,
            colour_begin_: [0, 0, 0, 0],
            colour_end_: [0, 0, 0, 0],
            colour_: [0, 0, 0, 0],
            lifetime_: 0,
            lifetime_remaining_: 0,
        };
    }
}

export function update_particles(delta: number): void
{
    let delta_in_seconds = (delta / 1000);
    let indexes = active_particles.values();
    for (let i of indexes)
    {
        let particle = particles[i];
        if (particle.lifetime_remaining_ <= 0)
        {
            active_particles.delete(i);
            continue;
        }

        particle.lifetime_remaining_ -= delta;

        particle.position_[X] += particle.velocity_[X] * delta_in_seconds;
        particle.position_[Y] += particle.velocity_[Y] * delta_in_seconds;

        let life_progress = particle.lifetime_remaining_ / particle.lifetime_;

        particle.size_ = floor(lerp(particle.size_end_, particle.size_begin_, life_progress));

        let colour_begin = particle.colour_begin_;
        let colour_end = particle.colour_end_;

        particle.colour_[R] = floor(lerp(colour_end[R], colour_begin[R], life_progress));
        particle.colour_[G] = floor(lerp(colour_end[G], colour_begin[G], life_progress));
        particle.colour_[B] = floor(lerp(colour_end[B], colour_begin[B], life_progress));
        particle.colour_[A] = floor(lerp(colour_end[A], colour_begin[A], life_progress));
    }
}

export let clear_particles = (): void =>
{
    active_particles.clear();
};

export function draw_particles(delta: number): void
{
    let indexes = active_particles.values();
    for (let i of indexes)
    {
        let particle = particles[i];
        let halfSize = floor(particle.size_ / 2);
        push_quad(floor(particle.position_[X]) - halfSize, floor(particle.position_[Y]) - halfSize,
            particle.size_, particle.size_,
            to_abgr_value(particle.colour_[R], particle.colour_[G], particle.colour_[B], particle.colour_[A]));
    }
}

export function emit_particle(x: number, y: number, vx: number, vy: number, vrx: number, vry: number, size_begin: number, size_end: number, size_variation: number, from_colour: number, to_colour: number, lifetime: number): void
{
    active_particles.add(pool_index);
    let particle = particles[pool_index];

    set_V2(particle.position_, x, y);

    particle.velocity_[X] = vx + vrx * (math.random() - 0.5);
    particle.velocity_[Y] = vy + vry * (math.random() - 0.5);

    set_v4_to_colour(particle.colour_begin_, from_colour);
    set_v4_to_colour(particle.colour_end_, to_colour);
    set_v4_to_colour(particle.colour_, from_colour);

    particle.lifetime_ = lifetime;
    particle.lifetime_remaining_ = lifetime;

    particle.size_begin_ = size_begin + size_variation * (math.random() - 0.5);
    particle.size_end_ = size_end;
    particle.size_ = particle.size_begin_;

    --pool_index;
    if (pool_index < 0)
        pool_index = MAX_PARTICLES - 1;
}