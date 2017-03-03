import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class PaisService extends BaseService {

    getPaises(): Observable<any[]> {
        return this.get(this.paisesURL);
    }
}
