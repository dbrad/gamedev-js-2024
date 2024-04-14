#version 300 es
precision lowp float;

in vec2 v, t, s, u;
in vec4 c;

out vec2 vu;
out vec4 vc;

const vec2 r = vec2(640, 360);

void main() {
    vu = u;
    vc = c;
    gl_Position = vec4((floor(v * s + t) / r * 2.0 - 1.0) * vec2(1, -1), 0.0, 1.0); 
}