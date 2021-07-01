uniform sampler2D velocity;
uniform vec2 gridSize;
uniform float gridScale;

void main()
{
    // normalize current position
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // get the y-velocity a bit left of current position
    float vl = texture2D(velocity, uv - xOffset).y;
    // get the y-velocity a bit right of current position
    float vr = texture2D(velocity, uv + xOffset).y;
    // get the x-velocity a bit below of current position
    float vb = texture2D(velocity, uv - yOffset).x;
    // get the x-velocity a bit above of current position
    float vt = texture2D(velocity, uv + yOffset).x;

    float scale = 0.5 / gridScale;
    gl_FragColor = vec4(scale * (vr - vl - vt + vb), 0.0, 0.0, 1.0);
}
