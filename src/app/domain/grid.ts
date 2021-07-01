import { Vector2 } from 'three';

export class Grid {
    size: Vector2;
    scale: number;

    constructor() {
        this.size = new Vector2(512, 256);
        // The grid scale is the actual size of a cell.
        // If this would be increased so, the cell is not figuratively larger,
        // but in the calculations the timestep * 1/gridscale is calculated whereby the
        // diffusion between the cells is significantly slower.
        this.scale = 1;
    }
}
