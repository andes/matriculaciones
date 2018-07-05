import { Injectable } from '@angular/core';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';

@Injectable()
export class NumeracionMatriculasService extends BaseService {

    constructor(_http: Http, private server: Server) {
        super(_http);
    }

    getOne(params: any): Observable<any> {
        return this.server.get(this.numeracionesURL + '/' , { params: params, showError: true });
    }

    saveNumeracion(numeracionModel): Observable<any> {
        return this.server.post(this.numeracionesURL, numeracionModel);
    }

    putNumeracion(numeracionModel): Observable<any> {
        return this.server.put(this.numeracionesURL , numeracionModel);
        // return this.server.post(this.profesionalesURL + 'actualizar', profesionalModel);
    }

    getNumeraciones(searchParams: any): Observable<any> {
        const parametros: any = {
            offset: null,
            size: null,
            codigo: null,
            codigoEspecialidad: null
        };

        if (searchParams.offset) {
            parametros.offset = searchParams.offset;
        }

        if (searchParams.size) {
            parametros.size =  searchParams.size;
        }

        if (searchParams.codigo) {
            parametros.codigo = searchParams.codigo;
        }

        if (searchParams.codigoEspecialidad) {
            parametros.codigoEspecialidad = searchParams.codigoEspecialidad;
        }

        return this.server.get(this.numeracionesURL , {params : parametros});
    }



}
