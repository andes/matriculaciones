import { AppSettings } from './../app.settings';
import { ISiisa } from './../interfaces/ISiisa';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class SexoService extends BaseService {

    private sexosUrl = this.siisaURL + '/sexo';

    getSexos(): Observable<ISiisa[]> {
        return this.get(this.sexosUrl);
    }
}