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

    getNumeraciones(searchParams: any): Observable<any> {
        console.log(searchParams)
        const query = new URLSearchParams();

        if (searchParams.offset) {
            query.set('offset', searchParams.offset);
        }

        if (searchParams.size) {
            query.set('size', searchParams.size);
        }

        if (searchParams.profesion) {
            query.set('codigo', searchParams.profesion._id);
        }
        if (searchParams.especialidad) {
            query.set('codigoEspecialidad', searchParams.especialidad._id);
        }

        return this.get(this.numeracionesURL, query);
    }
}
