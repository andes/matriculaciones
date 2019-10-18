import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';

@Injectable()
export class PaisService {
    private paisesURL = '/core/tm/paises';  // URL to web api

    constructor(private server: Server) { }

    getPaises(id?): Observable<any[]> {
        if (id) {
            return this.server.get(this.paisesURL + '/' + id);
        } else {
            return this.server.get(this.paisesURL);
        }

    }
}
