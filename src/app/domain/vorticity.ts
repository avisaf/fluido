import { WebGLRenderer } from 'three';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';

export class Vorticity extends SlabopBase {

    static uniforms = Vorticity.initializeUniforms();
    grid: Grid;

    constructor(fs: string, grid: Grid) {
        super(fs, Vorticity.uniforms, grid);
        this.grid = grid;
    }

    static initializeUniforms(): any {
        return {
            velocity: {
                type: 't'
            },
            gridSize: {
                type: 'v2'
            },
            gridScale: {
                type: 'f'
            },
        };
    }

    compute(renderer: WebGLRenderer, velocity: Slab, output: Slab) {
        Vorticity.uniforms.velocity.value = velocity.read.texture;
        Vorticity.uniforms.gridSize.value = this.grid.size;
        Vorticity.uniforms.gridScale.value = this.grid.scale;


        renderer.setRenderTarget(output.write);
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        output.swap();
    }
}
