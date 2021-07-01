uniform sampler2D velocity;
uniform vec2 gridSize;
uniform float gridScale;

void main()
{
    // The divergence of a vector field indicates whether more velocity is pointing in or out of an infinitesimal piece
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // get x-velocity a bit left of current position
    float vl = texture2D(velocity, uv - xOffset).x;
    // get x-velocity a bit right of current position
    float vr = texture2D(velocity, uv + xOffset).x;
    // get y-velocity a bit below of current position
    float vb = texture2D(velocity, uv - yOffset).y;
    // get y-velocity a bit above of current position
    float vt = texture2D(velocity, uv + yOffset).y;

    float scale = 0.5 / gridScale;
    // divergence == change in x + change in y
    float divergence = scale * (vr - vl + vt - vb);

    gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
