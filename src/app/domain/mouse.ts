import { Vector2 } from 'three';
import { Grid } from './grid';
import { Motion } from './motion';

export class Mouse {
    grid: Grid;
    position: Vector2;
    motions: Motion[];
    isMouseLeft: boolean;
    isMouseRight: boolean;

    constructor(grid: Grid) {
        this.grid = grid;
        this.position = new Vector2();
        this.motions = [];
        this.isMouseLeft = false;
        this.isMouseRight = false;
    }

    // handle mouse down event
    down(event: MouseEvent): void {
        this.position.set(event.clientX, event.clientY);
        this.isMouseLeft = event.button === 0;
        this.isMouseRight = event.button === 2;
    }

    // handle mouse up event
    up(event: MouseEvent): void {
        event.preventDefault();
        this.isMouseLeft = event.button === 0 ? false : this.isMouseLeft;
        this.isMouseRight = event.button === 2 ? false : this.isMouseRight;
    }

    // handle mouse move event
    move(event: MouseEvent): void {
        event.preventDefault();
        const r = this.grid.scale;

        const x = event.clientX;
        const y = event.clientY;

        // only add the motion if one of the mouse buttons is clicked
        if (this.isMouseLeft || this.isMouseRight) {
            const dx = x - this.position.x;
            const dy = y - this.position.y;

            this.motions.push(
                new Motion(
                    this.isMouseLeft,
                    this.isMouseRight,
                    // the x and y force f is clamped to an int value -1 <= f <= 1
                    new Vector2(Math.min(Math.max(dx, -r), r), Math.min(Math.max(dy, -r), r)),
                    new Vector2(x, y)
                )
            );
        }

        this.position.set(x, y);
    }

    contextMenu(event: MouseEvent): void {
        event.preventDefault();
    }
}
