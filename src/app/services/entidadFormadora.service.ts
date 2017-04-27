import { Http } from '@angular/http';
import { AppSettings } from './../app.settings';
import { IEntidadFormadora } from './../interfaces/IEntidadFormadora';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EntidadFormadoraService extends BaseService {

    private entidadesFormadorasUrl = this.siisaURL + '/entidadesFormadoras';
    constructor(_http: Http) {
        super(_http);
    }
    getEntidadesFormadoras(): Observable<IEntidadFormadora[]> {
        return this.get(this.entidadesFormadorasUrl);
    }
}
