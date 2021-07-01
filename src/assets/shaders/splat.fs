uniform sampler2D read; // velocity or density
uniform vec2 gridSize;
uniform vec3 color; // force or source
uniform vec2 point; // grid cell the mouse points to
uniform float radius;

// the smaller |p|, the bigger is exp(-dot(p, p) / r)
// the bigger |p|, the bigger is |-dot(p, p)|
// dividing this by a value < 1 is equal to multiplying it
// with the fraction where the numerator and denominator are swapped
// difference of Gaussians
float gauss(vec2 p, float r)
{
    return exp(-dot(p, p) / r);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / gridSize.xy; // normalize value
    vec3 base = texture2D(read, uv).xyz; // get the current value
    vec2 coord = point.xy - gl_FragCoord.xy;
    vec3 splat = color * gauss(coord, gridSize.x * radius);
    gl_FragColor = vec4(base + splat, 1.0); // add the newly calculated value
}
