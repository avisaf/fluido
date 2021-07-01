import { WebGLRenderer } from 'three';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';

export class Gradient extends SlabopBase {
    static uniforms = Gradient.initializeUniforms();
    grid: Grid;

    constructor(fs: string, grid: Grid) {
        super(fs, Gradient.uniforms, grid);

        this.grid = grid;
    }

    static initializeUniforms(): any {
        return {
            p: {
                type: 't'
            },
            w: {
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

    compute(renderer: WebGLRenderer, p: Slab, w: Slab, output: Slab): void {
        Gradient.uniforms.p.value = p.read.texture;
        Gradient.uniforms.w.value = w.read.texture;
        Gradient.uniforms.gridSize.value = this.grid.size;
        Gradient.uniforms.gridScale.value = this.grid.scale;

        renderer.autoClear = false;
        renderer.setRenderTarget(output.write);
        renderer.render(this.scene, this.camera);
        output.swap();
    }
}
