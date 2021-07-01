uniform sampler2D velocity;
uniform sampler2D vorticity;
uniform vec2 gridSize;
uniform float gridScale;
uniform float timestep;
uniform float epsilon;
uniform vec2 curl;

void main()
{
    // Normalize the current frag position
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // get the vorticity a bit left of the current position
    float vl = texture2D(vorticity, uv - xOffset).x;
    // get the vorticity a bit right of the current position
    float vr = texture2D(vorticity, uv + xOffset).x;
    // get the vorticity a bit below of the current position
    float vb = texture2D(vorticity, uv - yOffset).x;
    // get the vorticity a bit above of the current position
    float vt = texture2D(vorticity, uv + yOffset).x;
    // get the vorticity at the current position
    float vc = texture2D(vorticity, uv).x;

    float scale = 0.5 / gridScale;
    // calculate the force the current grid cell is experiencing
    vec2 force = scale * vec2(abs(vt) - abs(vb), abs(vr) - abs(vl));
    // maybe max(epsilon, dot(force, force)) is used to be sure to do not devide by 0 in the next step
    float lengthSquared = max(epsilon, dot(force, force));
    force *= inversesqrt(lengthSquared) * curl * vc;
    // inverte the direction probably because of the origin of the coordinate system
    force.y *= -1.0;

    // get the current velocity for the current grid cell
    vec2 velc = texture2D(velocity, uv).xy;
    gl_FragColor = vec4(velc + (timestep * force), 0.0, 1.0);
}
