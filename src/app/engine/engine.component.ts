import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { timeStamp } from 'console';
import { Vector2, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Display } from '../domain/display';
import { Grid } from '../domain/grid';
import { Mouse } from '../domain/mouse';
import { Shaders } from '../domain/shaders';
import { Solver } from '../domain/solver';
import { Time } from '../domain/time';
import { ShaderService } from '../services/shader.service';

@Component({
    selector: 'app-engine',
    templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit, OnDestroy {

    @ViewChild('rendererCanvas', { static: true })
    public rendererCanvas: ElementRef<HTMLCanvasElement>;
    public canvas: HTMLCanvasElement;
    private renderer: WebGLRenderer;
    private frameId: number = null;
    private grid: Grid;
    private time: Time;
    private display: Display;
    private solver: Solver;
    private fps = 0;
    private prevTime = 0;
    private counter = 0;
    mouse: Mouse;

    public constructor(private ngZone: NgZone, private shaderService: ShaderService) {
    }

    public ngOnInit(): void {
        this.shaderService.loadShaders();
        this.grid = new Grid();
        this.mouse = new Mouse(this.grid);
        // when all shaders are loaded, start the animation
        this.shaderService.shaders.subscribe({
            next: shaders => {
                if (!!shaders) {
                    this.createScene(this.rendererCanvas, shaders);
                    this.animate();
                }
            }
        });
    }

    public ngOnDestroy(): void {
        if (this.frameId != null) {
            cancelAnimationFrame(this.frameId);
        }
    }

    public createScene(canvas: ElementRef<HTMLCanvasElement>, shaders: Shaders): void {
        // The first step is to get the reference of the canvas element from our HTML document
        this.canvas = canvas.nativeElement;

        // initialize the renderer
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.sortObjects = false;
        this.renderer.autoClear = false;
        this.renderer.sortObjects = false;
        this.renderer.pixelRatio = window.devicePixelRatio;
        this.renderer.setClearColor(0x00ff00);

        this.time = new Time();

        this.solver = new Solver(this.grid, this.time, new Vector2(window.innerWidth, window.innerHeight), shaders);

        this.display = new Display(shaders.basic, shaders.displayscalar);
    }

    public animate(): void {
        // We have to run this outside angular zones,
        // because it could trigger heavy changeDetection cycles.
        this.ngZone.runOutsideAngular(() => {
            if (document.readyState !== 'loading') {
                this.update(0);
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    this.update(0);
                });
            }

            window.addEventListener('resize', () => {
                this.resize();
            });
        });
    }

    public update(timestamp: number): void {
        if (this.prevTime !== 0) {
            const deltaT = timestamp - this.prevTime;
            this.fps = Math.floor(1000 / deltaT);
            this.counter++;
        }

        this.prevTime = timestamp;

        // we can not rely on the chnage detection of angular
        if (this.counter === 5) {
            document.getElementById('framerate').innerText = this.fps.toString();
            this.counter = 0;
        }

        this.solver.step(this.renderer, this.mouse);
        this.render();

        this.frameId = requestAnimationFrame(t => {
            this.update(t);
        });
    }

    public render(): void {
        const read: WebGLRenderTarget = this.solver.density.read;
        this.display.scale.copy(this.solver.ink);
        this.display.bias.set(0, 0, 0);
        this.display.render(this.renderer, read);
    }

    public resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.solver.windowSize = new Vector2(width, height);
    }
}
