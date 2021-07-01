uniform sampler2D read;
uniform vec2 gridSize;
uniform vec2 gridOffset;
uniform float scale;

void main()
{
    // get only the values on the lines
    // (because the fragment shader is only called for fragments where a geometric object is present)
    vec2 uv = (gl_FragCoord.xy + gridOffset.xy) / gridSize.xy;
    // invert the velocity of the border grid cells
    gl_FragColor = vec4(scale * texture2D(read, uv).xyz, 1.0);
}
