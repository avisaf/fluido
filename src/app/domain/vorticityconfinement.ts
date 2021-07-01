import { Vector2, WebGLRenderer } from 'three';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';
import { Time } from './time';

export class VorticityConfinement extends SlabopBase {

    static uniforms = VorticityConfinement.initializeUniforms();
    grid: Grid;
    time: Time;
    epsilon: number;
    curl: number;

    constructor(fs: string, grid: Grid, time: Time, epsilon?: number, curl?: number) {
        super(fs, VorticityConfinement.uniforms, grid);

        this.grid = grid;
        this.time = time;
        this.epsilon = !!epsilon ? epsilon : 2.4414e-4;
        this.curl = !!curl ? curl : 0.3;
    }

    static initializeUniforms(): any {
        return {
            velocity: {
                type: 't'
            },
            vorticity: {
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
            epsilon: {
                type: 'f'
            },
            curl: {
                type: 'v2',
                value: new Vector2()
            },
        };
    }

    compute(renderer: WebGLRenderer, velocity: Slab, vorticity: Slab, output: Slab): void {
        VorticityConfinement.uniforms.velocity.value = velocity.read.texture;
        VorticityConfinement.uniforms.vorticity.value = vorticity.read.texture;
        VorticityConfinement.uniforms.gridSize.value = this.grid.size;
        VorticityConfinement.uniforms.gridScale.value = this.grid.scale;
        VorticityConfinement.uniforms.timestep.value = this.time.step;
        VorticityConfinement.uniforms.epsilon.value = this.epsilon;
        VorticityConfinement.uniforms.curl.value.set(
            this.curl * this.grid.scale,
            this.curl * this.grid.scale
        );

        renderer.autoClear = false;
        renderer.setRenderTarget(output.write);
        renderer.render(this.scene, this.camera);
        output.swap();
    }
}
