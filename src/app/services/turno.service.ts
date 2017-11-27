import { Injectable } from '@angular/core';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';

import {
    Server
} from '@andes/shared';

import {
    ITurno
} from './../interfaces/ITurno';


@Injectable()
export class TurnoService extends BaseService {

    private turnosMatriculacionURL = this.turnosURL + 'matriculacion/';
    private turnosRenovacionURL = this.turnosURL + 'renovacion/';
    private turnosProximosURL = this.turnosURL + 'proximos/';
    private turnosSolicitados = this.turnosSolicidatosURL;

    constructor(_http: Http, private _server: Server) {
        super(_http);
    }

    getTurnosProximos(search: any): Observable<any> {
        // return this._http.get(this.turnosProximosURL, search);
        return this.getTurnos(this.turnosProximosURL, search);
    }

    getTurnosMatriculacion(fecha: Date, searchParams: any): Observable<any[]> {
        return this.getTurnos(this.turnosMatriculacionURL, searchParams);
    }

    getTurnosRenovacion(fecha: Date, searchParams: any): Observable<any[]> {
        return this.getTurnos(this.turnosRenovacionURL, searchParams);
    }

    saveTurnoMatriculacion(turnoModel: any): Observable<any> {
        return this.post(this.turnosMatriculacionURL + turnoModel.profesional, turnoModel);
    }

    saveTurno(turnoModel): Observable<any> {
        return this.post(this.turnosURL + 'save/' + turnoModel._id, turnoModel);
    }

    saveTurnoSolicitados(turnoSolicitado: any) {
        return this._server.post(this.turnosSolicitados, turnoSolicitado);
    }
    getTurnoSolicitados(dni: any): Observable<any> {
        return this._server.get(this.turnosSolicitados + 'traePDni/' + dni);
    }
    getTurnos(url: string, searchParams: any): Observable<any> {
        const query = new URLSearchParams();

        if (searchParams.anio) {
            query.set('anio', searchParams.anio);
        }

        if (searchParams.mes) {
            query.set('mes', searchParams.mes);
        }

        if (searchParams.dia) {
            query.set('dia', searchParams.dia);
        }

        if (searchParams.offset) {
            query.set('offset', searchParams.offset);
        }

        if (searchParams.size) {
            query.set('size', searchParams.size);
        }

        if (searchParams.nombre) {
            query.set('nombre', searchParams.nombre);
        }

        if (searchParams.apellido) {
            query.set('apellido', searchParams.apellido);
        }

        if (searchParams.fecha) {
            query.set('fecha', searchParams.fecha);
        }

        if (searchParams.documento) {
            query.set('documento', searchParams.documento);
        }

        return this.get(url, query);
    }
}
