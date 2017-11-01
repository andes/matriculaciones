import { Http } from '@angular/http';
import { AppSettings } from './../app.settings';
import { ISiisa } from './../interfaces/ISiisa';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';
import { Server } from '@andes/shared';
import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SexoService  {

    private sexosUrl = AppSettings.API_ENDPOINT + '/core/tm/siisa'  + '/sexo';
    constructor(private server: Server) {
    }
    getSexos(): Observable<ISiisa[]> {
        return this.server.get(this.sexosUrl);
    }
}
