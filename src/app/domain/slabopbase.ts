import { Mesh, NoBlending, OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial } from 'three';
import { Grid } from './grid';

export class SlabopBase {

    private readonly geometry: PlaneBufferGeometry;
    private readonly material: ShaderMaterial;
    private readonly quad: Mesh;

    camera: OrthographicCamera;
    scene: Scene;

    constructor(fs: string, uniforms: any, grid: Grid) {
        this.geometry = new PlaneBufferGeometry(2 * (grid.size.x - 2) / grid.size.x, 2 * (grid.size.y - 2) / grid.size.y);
        this.material = new ShaderMaterial({
            uniforms,
            fragmentShader: fs,
            depthWrite: false,
            depthTest: false,
            blending: NoBlending
        });
        this.quad = new Mesh(this.geometry, this.material);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new Scene();
        this.scene.add(this.quad);
    }
}
