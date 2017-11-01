import { AppSettings } from './../app.settings';
import { IProfesion } from './../interfaces/IProfesion';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';
import { URLSearchParams, RequestOptionsArgs , Response, Http } from '@angular/http';
import { Server } from '@andes/shared';
import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProfesionService {
    profesionesURL = AppSettings.API_ENDPOINT + '/core/tm/profesiones';

    constructor(private server: Server) {

    }

    getProfesiones(): Observable<any[]> {
        return this.server.get(this.profesionesURL);
    }
}
