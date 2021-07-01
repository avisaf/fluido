import {
    BufferAttribute,
    BufferGeometry,
    Line,
    NoBlending,
    OrthographicCamera,
    Scene,
    ShaderMaterial,
    Vector3,
    WebGLRenderer
} from 'three';
import { Grid } from './grid';
import { Slab } from './slab';

export class Boundary {

    grid: Grid;
    uniforms: any;
    lineL: Line;
    lineR: Line;
    lineB: Line;
    lineT: Line;
    camera: OrthographicCamera;
    scene: Scene;
    gridOffset: Vector3;

    constructor(fs: string, grid: Grid) {
        this.grid = grid;

        this.uniforms = {
            read: {
                type: 't'
            },
            gridSize: {
                type: 'v2'
            },
            gridOffset: {
                type: 'v2'
            },
            scale: {
                type: 'f'
            },
        };

        const material = new ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: fs,
            depthWrite: false,
            depthTest: false,
            blending: NoBlending
        });

        const x = (this.grid.size.x - 1) / this.grid.size.x;
        const y = (this.grid.size.y - 1) / this.grid.size.y;

        // Create lines on the left, right, top and bottom of the canvas
        this.lineL = Boundary.createLine([[-x, -y, 0], [-x, y, 0]], material);
        this.lineR = Boundary.createLine([[x, -y, 0], [x, y, 0]], material);
        this.lineB = Boundary.createLine([[-x, -y, 0], [x, -y, 0]], material);
        this.lineT = Boundary.createLine([[-x, y, 0], [x, y, 0]], material);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new Scene();

        this.gridOffset = new Vector3();

    }

    static createLine(positions: Array<Array<number>>, material: ShaderMaterial) {
        const vertices = new Float32Array(positions.length * 3);
        // flatten the 2D array
        for (let i = 0; i < positions.length; i++) {
            vertices[i * 3] = positions[i][0];
            vertices[i * 3 + 1] = positions[i][1];
            vertices[i * 3 + 2] = positions[i][2];
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));

        return new Line(geometry, material);
    }

    compute(renderer: WebGLRenderer, input: Slab, scale: number, output: Slab) {
        this.uniforms.read.value = input.read.texture;
        this.uniforms.gridSize.value = this.grid.size;
        this.uniforms.scale.value = scale;

        this.renderLine(renderer, this.lineL, [1, 0], output);
        this.renderLine(renderer, this.lineR, [-1, 0], output);
        this.renderLine(renderer, this.lineB, [0, 1], output);
        this.renderLine(renderer, this.lineT, [0, -1], output);
    }

    renderLine(renderer: WebGLRenderer, line: Line, offset: Array<number>, output: Slab) {
        this.scene.add(line);
        this.gridOffset.set(offset[0], offset[1], null);
        this.uniforms.gridOffset.value = this.gridOffset;
        renderer.setRenderTarget(output.write);
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        this.scene.remove(line);
        // we do not swap output, the next slab operation will fill in the
        // iterior and swap it
    }
}
