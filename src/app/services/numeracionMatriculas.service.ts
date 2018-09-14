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
            codigoEspecialidad: null,
            especialidad: null,
            profesion: null

        };

        if (searchParams.offset) {
            parametros.offset = searchParams.offset;
        }

        if (searchParams.size) {
            parametros.size =  searchParams.size;
        }

        if (searchParams.profesion) {
            parametros.codigo = searchParams.profesion.codigo;
        }

        if (searchParams.especialidad) {
            parametros.codigoEspecialidad = searchParams.especialidad.codigo;
        }


        return this.server.get(this.numeracionesURL , {params : parametros});
    }



}
