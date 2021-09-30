import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class ProfesionService {
    profesionesURL = '/core/tm/profesiones';

    constructor(private server: Server) {

    }

    getProfesiones(params: any): Observable<any[]> {
        return this.server.get(this.profesionesURL, { params: params, showError: true });
    }
}
