uniform sampler2D p;
uniform sampler2D w;
uniform vec2 gridSize;
uniform float gridScale;

void main()
{
    vec2 uv = gl_FragCoord.xy / gridSize.xy;

    vec2 xOffset = vec2(1.0 / gridSize.x, 0.0);
    vec2 yOffset = vec2(0.0, 1.0 / gridSize.y);

    // get the pressure refined pressure a bit left of the current position
    float pl = texture2D(p, uv - xOffset).x;
    // get the pressure refined pressure a bit right of the current position
    float pr = texture2D(p, uv + xOffset).x;
    // get the pressure refined pressure a bit below of the current position
    float pb = texture2D(p, uv - yOffset).x;
    // get the pressure refined pressure a bit above of the current position
    float pt = texture2D(p, uv + yOffset).x;

    float scale = 0.5 / gridScale;
    // calculate the gradient of the pressure
    vec2 gradient = scale * vec2(pr - pl, pt - pb);

    vec2 wc = texture2D(w, uv).xy;

    // subtract the gradient from the current velocity
    gl_FragColor = vec4(wc - gradient, 0.0, 1.0);
}
