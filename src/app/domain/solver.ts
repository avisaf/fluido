import { Vector2, Vector3, WebGLRenderer } from 'three';
import { Advect } from './advect';
import { Boundary } from './boundary';
import { Divergence } from './divergence';
import { Gradient } from './gradient';
import { Grid } from './grid';
import { Jacobi } from './jacobi';
import { Mouse } from './mouse';
import { Shaders } from './shaders';
import { Slab } from './slab';
import { Splat } from './splat';
import { Time } from './time';
import { Vorticity } from './vorticity';
import { VorticityConfinement } from './vorticityconfinement';

export class Solver {
    grid: Grid;
    time: Time;
    windowSize: Vector2;

    velocity: Slab;
    density: Slab;
    velocityDivergence: Slab;
    velocityVorticity: Slab;
    pressure: Slab;

    advect: Advect;
    divergence: Divergence;
    poissonPressureEq: Jacobi;
    gradient: Gradient;
    splat: Splat;
    vorticity: Vorticity;
    vorticityConfinement: VorticityConfinement;
    boundary: Boundary;

    source: Vector3;
    ink: Vector3;

    constructor(grid: Grid, time: Time, windowSize: Vector2, shaders: Shaders) {
        this.grid = grid;
        this.time = time;
        this.windowSize = windowSize;

        const h: number = this.grid.size.y;
        const w: number = this.grid.size.x;

        // initialize all needed slabs
        this.velocity = new Slab(w, h);
        this.density = new Slab(w, h);
        this.velocityDivergence = new Slab(w, h);
        this.velocityVorticity = new Slab(w, h);
        this.pressure = new Slab(w, h);

        // initialize all needed slabops
        this.advect = new Advect(shaders.advect, grid, time);
        this.divergence = new Divergence(shaders.divergence, grid);
        this.poissonPressureEq = new Jacobi(shaders.jacobiscalar, grid);
        this.gradient = new Gradient(shaders.gradient, grid);
        this.splat = new Splat(shaders.splat, grid);
        this.vorticity = new Vorticity(shaders.vorticity, grid);
        this.vorticityConfinement = new VorticityConfinement(shaders.vorticityforce, grid, time);
        this.boundary = new Boundary(shaders.boundary, grid);

        this.source = new Vector3(0.8, 0.0, 0.0);
        // here you can define the color of the fluid
        this.ink = new Vector3(0, 0, 1.0);
    }

    // calculates the force the fluid is experiencing by moving the mouse
    addForces(renderer: WebGLRenderer, mouse: Mouse) {
        const point = new Vector2();
        const force = new Vector3();

        for (const motion of mouse.motions) {
            point.set(motion.position.x, this.windowSize.y - motion.position.y);
            // normalize to [0, 1] and scale to grid size
            point.x = (point.x / this.windowSize.x) * this.grid.size.x;
            point.y = (point.y / this.windowSize.y) * this.grid.size.y;

            if (motion.left) {
                force.set(
                    motion.drag.x,
                    -motion.drag.y,
                    0
                );
                // add the force to the velocity field
                this.splat.compute(
                    renderer,
                    this.velocity,
                    force,
                    point,
                    this.velocity
                );
                this.boundary.compute(renderer, this.velocity, -1, this.velocity);
            }

            // if right click add fluid to the grid
            if (motion.right) {
                this.splat.compute(
                    renderer,
                    this.density,
                    this.source,
                    point,
                    this.density
                );
            }
        }
        mouse.motions = [];
    }


    // The simulation step
    step(renderer: WebGLRenderer, mouse: Mouse) {
        const temp = this.advect.dissipation;
        // the velocity should not dissipate over time
        this.advect.dissipation = 1;
        // calculate advection and of the velocity field and apply the boundary conditions to keep the velocity in the simulation domain
        this.advect.compute(renderer, this.velocity, this.velocity, this.velocity);
        this.boundary.compute(renderer, this.velocity, -1, this.velocity);

        // advect the density
        this.advect.dissipation = temp;
        this.advect.compute(renderer, this.velocity, this.density, this.density);

        this.addForces(renderer, mouse);

        // calculate the position of the vortices and give them more force
        this.vorticity.compute(renderer, this.velocity, this.velocityVorticity);
        this.vorticityConfinement.compute(
            renderer,
            this.velocity,
            this.velocityVorticity,
            this.velocity
        );
        // apply boundary conditions as the velocity is changed in the previous step
        this.boundary.compute(renderer, this.velocity, -1, this.velocity);

        this.project(renderer);
    }

    project(renderer: WebGLRenderer) {
        // Calculate the velocity divergence. It is needed for the calculation of the pressure
        this.divergence.compute(
            renderer,
            this.velocity,
            this.velocityDivergence
        );

        // 0 is our initial guess for the poisson equation solver
        this.clearSlab(renderer, this.pressure);

        // Calculate the pressure
        this.poissonPressureEq.alpha = -this.grid.scale * this.grid.scale;
        this.poissonPressureEq.compute(
            renderer,
            this.pressure,
            this.velocityDivergence,
            this.pressure,
            this.boundary,
            1
        );

        // Substract the pressure of the velocity. Makes the velocity mass conserving
        this.gradient.compute(
            renderer,
            this.pressure,
            this.velocity,
            this.velocity
        );
        this.boundary.compute(renderer, this.velocity, -1, this.velocity);
    }

    clearSlab(renderer: WebGLRenderer, slab: Slab) {
        renderer.setRenderTarget(slab.read);
        renderer.clear(true, false, false);
        slab.swap();
    }
}
