import { AppSettings } from './../app.settings';
import { IProfesion } from './../interfaces/IProfesion';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProfesionService extends BaseService {

    private profesionesUrl = this.siisaURL + '/profesion';

    constructor(_http: Http) {
        super(_http);
    }

    getProfesiones(): Observable<any[]> {
        return this.get(this.profesionesUrl);
    }
}
