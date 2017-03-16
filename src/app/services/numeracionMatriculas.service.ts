import { Injectable } from '@angular/core';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class NumeracionMatriculasService extends BaseService {

    constructor(_http: Http) {
        super(_http);
    }

    getOne(codigo: string): Observable<any> {
        return this.get(this.numeracionesURL + '/' + codigo);
    }

    saveNumeracion(numeracionModel: any): Observable<any> {
        return this.post(this.numeracionesURL, numeracionModel);
    }

    getNumeraciones(searchParams: any): Observable<any> {

        const query = new URLSearchParams();

        if (searchParams.offset) {
            query.set('offset', searchParams.offset);
        }

        if (searchParams.size) {
            query.set('size', searchParams.size);
        }

        if (searchParams.profesion) {
            query.set('codigo', searchParams.profesion.codigo);
        }

        return this.get(this.numeracionesURL, query);
    }
}
