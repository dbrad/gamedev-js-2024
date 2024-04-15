let idle_animation_timer = 0;
export let idle_frame = 0;
export let update_idle_animation_frame = (delta: number) =>
{
    idle_animation_timer += delta;
    if (idle_animation_timer > 500)
    {
        if (idle_animation_timer > 1000) idle_animation_timer = 0;
        idle_animation_timer -= 500;
        idle_frame = ++idle_frame % 2;
    }
};