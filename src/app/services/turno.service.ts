import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    constructor(_http: HttpClient, private _server: Server) {
        super(_http);
    }

    getTurnosProximos(search: any): Observable<any> {
        return this.getTurnos(this.turnosProximosURL, search);
    }

    getTurnosMatriculacion(fecha: Date, searchParams: any): Observable<any[]> {
        return this.getTurnos(this.turnosMatriculacionURL, searchParams);
    }

    saveTurnoMatriculacion(turnoModel: any): Observable<any> {
        return this._server.post(this.turnosMatriculacionURL + turnoModel.turno.profesional, turnoModel);
    }

    saveTurno(turnoModel): Observable<any> {
        return this._server.post(this.turnosURL + 'save/' + turnoModel._id, turnoModel);
    }

    saveTurnoSolicitados(turnoSolicitado: any) {
        return this._server.post(this.turnosSolicitados, turnoSolicitado);
    }
    getTurnoSolicitados(dni: any): Observable<any> {
        return this._server.get(this.turnosSolicitados + 'traePDni/' + dni);
    }

    getTurnos(url: string, searchParams: any): Observable<any> {
        const parametros: any = {
            anio: null,
            mes: null,
            dia: null,
            offset: null,
            size: null,
            nombre: null,
            apellido: null,
            fecha: null,
            documento: null
        };

        if (searchParams.anio) {
            parametros.anio = searchParams.anio;
        }

        if (searchParams.mes) {
            parametros.mes = searchParams.mes;
        }

        if (searchParams.dia) {
            parametros.dia = searchParams.dia;
        }

        if (searchParams.offset) {
            parametros.offset = searchParams.offset;
        }

        if (searchParams.size) {
            parametros.size = searchParams.size;
        }

        if (searchParams.nombre) {
            parametros.nombre = searchParams.nombre;
        }

        if (searchParams.apellido) {
            parametros.apellido = searchParams.apellido;
        }

        if (searchParams.fecha) {
            parametros.fecha = searchParams.fecha;
        }

        if (searchParams.documento) {
            parametros.documento = searchParams.documento;
        }

        return this._server.get(url, { params: parametros });
    }

    getTurnosPorDocumento(params) {
        return this._server.get(this.turnosURL + 'turnosPorDocumentos', { params: params, showError: true });
    }

    getTurnosMes(params) {
        return this._server.get(this.turnosURL + 'matriculaciones', { params: params, showError: true });
    }

}
