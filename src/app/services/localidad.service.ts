import { AppSettings } from './../app.settings';
import { ILocalidad } from './../interfaces/ILocalidad';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { Server } from '@andes/shared';
import 'rxjs/add/operator/toPromise';
import { environment } from './../../environments/environment';


import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class LocalidadService {

    private localidadUrl = '/core/tm/localidades';  // URL to web api
    private localidadMatriculacionesUrl = '/core/tm/localidadesMatriculacion';  // URL to web api

    constructor(private server: Server, private http: Http) { }

    getXProvincia(provincia: String) {
        if (provincia) {
            return this.server.get(this.localidadUrl + '?codigo=' + provincia);
        } else {
            return this.server.get(this.localidadUrl);
        }
    }


    handleError(error: any) {
        return Observable.throw(error.json().error || 'Server error');
    }
}
