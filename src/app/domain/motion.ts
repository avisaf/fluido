import { Vector2 } from 'three';

export class Motion {
    // is left button clicked
    left: boolean;
    // is right button clicked
    right: boolean;
    drag: Vector2;
    position: Vector2;

    constructor(left: boolean, right: boolean, drag: Vector2, position: Vector2) {
        this.left = left;
        this.right = right;
        this.drag = drag;
        this.position = position;
    }
}
