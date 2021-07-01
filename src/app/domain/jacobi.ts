import { WebGLRenderer } from 'three';
import { Boundary } from './boundary';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';

export class Jacobi extends SlabopBase {

    constructor(fs: string, grid: Grid, iterations?: number, alpha?: number, beta?: number) {
        super(fs, Jacobi.uniforms, grid);

        this.grid = grid;
        this.iterations = !!iterations ? iterations : 50;
        this.alpha = !!alpha ? alpha : -1;
        this.beta = !!beta ? beta : 4;
    }

    static uniforms = Jacobi.initializeUniforms();
    grid: Grid;
    iterations: number;
    alpha: number;
    beta: number;

    static initializeUniforms(): any {
        return {
            pressure: {
                type: 't'
            },
            velocityDivergence: {
                type: 't'
            },
            gridSize: {
                type: 'v2'
            },
            alpha: {
                type: 'f'
            },
            beta: {
                type: 'f'
            },
        };
    }

    compute(renderer: WebGLRenderer, pressure: Slab, velocityDivergence: Slab, output: Slab, boundary: Boundary, scale: number): void {
        for (let i = 0; i < this.iterations; i++) {
            this.step(renderer, pressure, velocityDivergence, output);
            boundary.compute(renderer, output, scale, output);
        }
    }

    step(renderer: WebGLRenderer, pressure: Slab, velocityDivergence: Slab, output: Slab): void {
        Jacobi.uniforms.pressure.value = pressure.read.texture;
        Jacobi.uniforms.velocityDivergence.value = velocityDivergence.read.texture;
        Jacobi.uniforms.gridSize.value = this.grid.size;
        Jacobi.uniforms.alpha.value = this.alpha;
        Jacobi.uniforms.beta.value = this.beta;

        renderer.autoClear = false;
        renderer.setRenderTarget(output.write);
        renderer.render(this.scene, this.camera);
        output.swap();
    }
}
