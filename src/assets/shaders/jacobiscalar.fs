uniform sampler2D pressure; // initial value of pressure is 0 all across the board
uniform sampler2D velocityDivergence;
uniform vec2 gridSize;
uniform float alpha;
uniform float beta;

void main()
{
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // get the pressure a bit left of the current position
    float xl = texture2D(pressure, uv - xOffset).x;
    // get the pressure a bit right of the current position
    float xr = texture2D(pressure, uv + xOffset).x;
    // get the pressure a bit below of the current position
    float xb = texture2D(pressure, uv - yOffset).x;
    // get the pressure a bit above of the current position
    float xt = texture2D(pressure, uv + yOffset).x;

    // get the divergence at the current position
    float bc = texture2D(velocityDivergence, uv).x;

    // this equation is described in RealtimeFluids2003
    gl_FragColor = vec4((xl + xr + xb + xt + alpha * bc) / beta, 0.0, 0.0, 1.0);
}
