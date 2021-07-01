import {
    Mesh,
    NoBlending,
    OrthographicCamera,
    PlaneBufferGeometry,
    Scene,
    ShaderMaterial,
    Vector3,
    WebGLRenderer,
    WebGLRenderTarget
} from 'three';

export class Display {
    bias: Vector3;
    scale: Vector3;
    uniforms: any;
    material: ShaderMaterial;
    camera: OrthographicCamera;
    scene: Scene;

    constructor(vs: string, fs: string, bias?: Vector3, scale?: Vector3) {
        this.bias = !!bias ? bias : new Vector3(0, 0, 0);
        this.scale = !!scale ? scale : new Vector3(1, 1, 1);

        this.uniforms = {
            read: {
                type: 't'
            },
            bias: {
                type: 'v3'
            },
            scale: {
                type: 'v3'
            }
        };
        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vs,
            fragmentShader: fs,
            depthWrite: false,
            depthTest: false,
            blending: NoBlending
        });
        const quad = new Mesh(new PlaneBufferGeometry(2, 2), this.material);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new Scene();
        this.scene.add(quad);
    }


    render(renderer: WebGLRenderer, read: WebGLRenderTarget) {
        // The WebGlRenderTarget is rendered on the canvas (WebGlRenderer)
        this.uniforms.read.value = read.texture;
        this.uniforms.bias.value = this.bias;
        this.uniforms.scale.value = this.scale;
        renderer.setRenderTarget(null);
        renderer.render(this.scene, this.camera);
    }

}
