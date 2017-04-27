import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import {Observable} from 'rxjs/Rx';
import { Http } from '@angular/http';

@Injectable()
export class PaisService extends BaseService {

    constructor(_http: Http) {
        super(_http);
    }
    getPaises(): Observable<any[]> {
        return this.get(this.paisesURL);
    }
}
