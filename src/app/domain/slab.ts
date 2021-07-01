import * as THREE from 'three';
import { WebGLRenderTarget } from 'three';

export class Slab {
    read: WebGLRenderTarget;
    write: WebGLRenderTarget;

    private options = {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false,
        shareDepthFrom: null
    };

    constructor(width: number, height: number) {
        this.read = new WebGLRenderTarget(width, height, this.options);
        this.write = this.read.clone();
    }

    swap() {
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
    }

}
