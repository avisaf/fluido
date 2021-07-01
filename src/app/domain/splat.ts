import { Vector2, Vector3, WebGLRenderer } from 'three';
import { Grid } from './grid';
import { Slab } from './slab';
import { SlabopBase } from './slabopbase';

export class Splat extends SlabopBase {
    static uniforms = Splat.initializeUniforms();
    grid: Grid;
    radius: number;

    constructor(fs: string, grid: Grid, radius?: number) {
        super(fs, Splat.uniforms, grid);

        this.grid = grid;
        this.radius = radius === undefined ? 0.01 : radius;
    }

    static initializeUniforms(): any {
        return {
            read: {
                type: 't'
            },
            gridSize: {
                type: 'v2'
            },
            color: {
                type: 'v3'
            },
            point: {
                type: 'v2'
            },
            radius: {
                type: 'f'
            }
        };
    }

    compute(renderer: WebGLRenderer, input: Slab, color: Vector3, point: Vector2, output: Slab) {
        Splat.uniforms.gridSize.value = this.grid.size;
        Splat.uniforms.read.value = input.read.texture;
        Splat.uniforms.color.value = color;
        Splat.uniforms.point.value = point;
        Splat.uniforms.radius.value = this.radius;

        renderer.setRenderTarget(output.write);
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        output.swap();

    }

}
