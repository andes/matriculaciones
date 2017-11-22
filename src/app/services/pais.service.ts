import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import {Observable} from 'rxjs/Rx';
import { Server } from '@andes/shared';

@Injectable()
export class PaisService  {
    private paisesURL = '/core/tm/paises';  // URL to web api

    constructor(private server: Server) { }

    getPaises(): Observable<any[]> {
        return this.server.get(this.paisesURL);
    }
}
