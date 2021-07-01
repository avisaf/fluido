uniform sampler2D read;
uniform vec3 bias;
uniform vec3 scale;

varying vec2 texCoord;

void main()
{
    // get the FragColor of the the texture
    gl_FragColor = vec4(bias + scale * texture2D(read, texCoord).xxx, 1.0);
}
