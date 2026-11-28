const POS = 'gl_Position = vec4(p.x / r.x * 2.0 - 1.0, 1.0 - p.y / r.y * 2.0, 0.0, 1.0);';

export const POINT_VS = `#version 300 es
in vec2 p;
in vec3 a;
in vec3 c;
uniform vec2 r;
uniform float t;
out vec3 vc;
out float vb;
void main() {
  ${POS}
  float w = 0.86 + 0.14 * sin(t * 1.6 + a.z * 6.283);
  gl_PointSize = a.x;
  vb = a.y * w;
  vc = c;
}`;

export const POINT_FS = `#version 300 es
precision mediump float;
in vec3 vc;
in float vb;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = length(q);
  float k = max(1.0 - d, 0.0);
  float core = 1.0 - smoothstep(0.0, 0.14, d);
  float glow = k * k * k * 0.8;
  float ray = ((1.0 - smoothstep(0.0, 0.05, abs(q.x))) + (1.0 - smoothstep(0.0, 0.05, abs(q.y)))) * k * k;
  float a = (core + glow + ray) * vb;
  o = vec4(mix(vc, vec3(1.0), core) * a, a);
}`;

export const LINE_VS = `#version 300 es
in vec2 p;
in float al;
uniform vec2 r;
out float v;
void main() {
  ${POS}
  v = al;
}`;

export const LINE_FS = `#version 300 es
precision mediump float;
in float v;
out vec4 o;
void main() {
  o = vec4(vec3(0.5, 0.7, 1.0) * v, v);
}`;
