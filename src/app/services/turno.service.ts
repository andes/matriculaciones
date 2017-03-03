import { Injectable } from '@angular/core';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class TurnoService extends BaseService {

    private turnosMatriculacionURL = this.turnosURL + 'matriculacion/';

    constructor(_http: Http) {
        super(_http);
    }

    getTurnosMatriculacion(fecha: Date, searchParams: any): Observable<any[]> {
        return this.getTurnos(this.turnosMatriculacionURL, searchParams);
    }

    saveTurnoMatriculacion(turnoModel: any): Observable<any> {
        return this.post(this.turnosMatriculacionURL + turnoModel._profesional, turnoModel);
    }

    getTurnos(url: string, searchParams: any): Observable<any[]> {
        const query = new URLSearchParams(searchParams);

        if (searchParams.anio) {
            query.set('anio', searchParams.anio);
        }

        if (searchParams.mes) {
            query.set('mes', searchParams.mes);
        }

        if (searchParams.dia) {
            query.set('dia', searchParams.dia);
        }

        return this.get(url, query);
    }
}
