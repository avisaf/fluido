import { Grid } from './grid';
import { Time } from './time';
import { SlabopBase } from './slabopbase';
import { WebGLRenderer } from 'three';
import { Slab } from './slab';

export class Advect extends SlabopBase {
    static uniforms = Advect.initializeUniforms();
    grid: Grid;
    time: Time;
    dissipation: number;

    constructor(fs: string, grid: Grid, time: Time, dissipation?: number) {
        super(fs, Advect.uniforms, grid);

        this.grid = grid;
        this.time = time;
        this.dissipation = dissipation === undefined ? 0.998 : dissipation;
    }

    static initializeUniforms(): any {
        return {
            velocity: {
                type: 't'
            },
            advected: {
                type: 't'
            },
            gridSize: {
                type: 'v2'
            },
            gridScale: {
                type: 'f'
            },
            timestep: {
                type: 'f'
            },
            dissipation: {
                type: 'f'
            }
        };
    }

    compute(renderer: WebGLRenderer, velocity: Slab, advected: Slab, output: Slab) {
        Advect.uniforms.velocity.value = velocity.read.texture;
        Advect.uniforms.advected.value = advected.read.texture;
        Advect.uniforms.gridSize.value = this.grid.size;
        Advect.uniforms.gridScale.value = this.grid.scale;
        Advect.uniforms.timestep.value = this.time.step;
        Advect.uniforms.dissipation.value = this.dissipation;

        renderer.setRenderTarget(output.write);
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        output.swap();
    }
}
