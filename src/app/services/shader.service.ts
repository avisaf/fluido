import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { Shaders } from '../domain/shaders';
import { environment } from '../../environments/environment';

const shaderNames: string[] = [
    'advect.fs',
    'basic.vs',
    'gradient.fs',
    'jacobiscalar.fs',
    'displayscalar.fs',
    'divergence.fs',
    'splat.fs',
    'vorticity.fs',
    'vorticityforce.fs',
    'boundary.fs'
];

@Injectable({
    providedIn: 'root'
})
export class ShaderService {
    shaders: ReplaySubject<Shaders> = new ReplaySubject(1);

    constructor(private httpClient: HttpClient) { }

    private loadFile(fileName: string): Observable<any> {
        return this.httpClient.get(`${environment.appPrefix}/assets/shaders/${fileName}`, { responseType: 'text' });
    }

    // get all shaders needed from the server
    loadShaders(): void {
        this.shaders.next(null);
        const shaderBuffer = new Shaders();

        let remainingShaders = shaderNames.length;

        for (const shaderName of shaderNames) {
            this.loadFile(shaderName).subscribe({
                next: x => {
                    shaderBuffer[shaderName.split('.')[0]] = x;
                    remainingShaders -= 1;

                    if (remainingShaders === 0) {
                        this.shaders.next(shaderBuffer);
                    }
                },
            });
        }
    }
}
