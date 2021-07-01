import { WebGLRenderer } from 'three';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';

export class Divergence extends SlabopBase {
    static uniforms = Divergence.initializeUniforms();
    grid: Grid;

    constructor(fs: string, grid: Grid) {
        super(fs, Divergence.uniforms, grid);
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

    compute(renderer: WebGLRenderer, velocity: Slab, divergence: Slab): void {
        Divergence.uniforms.velocity.value = velocity.read.texture;
        Divergence.uniforms.gridSize.value = this.grid.size;
        Divergence.uniforms.gridScale.value = this.grid.scale;

        renderer.autoClear = false;
        renderer.setRenderTarget(divergence.write);
        renderer.render(this.scene, this.camera);
        divergence.swap();
    }
}
