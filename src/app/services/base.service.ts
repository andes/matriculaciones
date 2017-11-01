import { AppSettings } from './../app.settings';
import { ITurno } from './../interfaces/ITurno';
import { Injectable } from '@angular/core';
import { Headers,
    Http,
    RequestOptions,
    RequestMethod,
    Response,
    URLSearchParams,
    RequestOptionsArgs
} from '@angular/http';

import {
    Server
} from '@andes/shared';


// Import RxJs required methods
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';

@Injectable()
export class BaseService {

    // URL to web api
    protected turnosURL = AppSettings.API_ENDPOINT + '/modules/matriculaciones/turnos/';
    protected paisesURL = AppSettings.API_ENDPOINT + '/core/tm/paises';
    protected profesionalesURL = AppSettings.API_ENDPOINT + '/core/tm/profesionales/';
    protected siisaURL = AppSettings.API_ENDPOINT + '/core/tm/siisa';
    protected numeracionesURL = AppSettings.API_ENDPOINT + '/modules/matriculaciones/numeraciones';
    protected profesionesURL = AppSettings.API_ENDPOINT + '/core/tm/profesiones';
    protected entidadFormadoraURL = AppSettings.API_ENDPOINT + '/modules/matriculaciones/entidadesFormadoras/';
    protected especialidadURL = AppSettings.API_ENDPOINT + '/core/tm/especialidades/';
    constructor(protected _http: Http) { }

    protected get(url: string, searchQuery?: URLSearchParams): Observable<any[]> {
        return this._http.get(url, { search: searchQuery}).map(this.extractData).catch(this.handleError);
    }

    protected post(url: string, data: Observable<any>): Observable<any> {
        return this._http.post(url, data).map(this.extractData).catch(this.handleError);
    }

    protected put(url: string, data: Observable<any>): Observable<any> {
        return this._http.put(url, data).map(this.extractData).catch(this.handleError);
    }

    protected getById(url: string, id: string): Observable<any> {
        return this._http.get(url + id).map(this.extractData).catch(this.handleError);
    }

    protected extractData(resp: Response): Observable<any[]> {
        const body = resp.json();
        return body;
    }

    protected handleError(error: any) {
        return Observable.throw(error.json().error || 'Server error');
    }
}
