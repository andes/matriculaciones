import { AppSettings } from './../app.settings';
import { IAgendaMatriculaciones } from './../interfaces/IAgendaMatriculaciones';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import 'rxjs/add/operator/toPromise';
import { environment } from './../../environments/environment';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AgendaService {

    private agendaUrl = '/modules/matriculaciones/agendaMatriculaciones'; // URL to web api

    constructor(private server: Server) { }

    get(): Observable<IAgendaMatriculaciones[]> {
        return this.server.get(this.agendaUrl);
    }

    save(agenda: any): Observable<IAgendaMatriculaciones> {

        if (agenda.id) {
            return this.server.put(this.agendaUrl + '/' + agenda.id, agenda);
        } else {
            return this.server.post(this.agendaUrl, agenda);

            // .map((res: Response) => res.json())
            // .catch(this.handleError);
        }
    }

    handleError(error: any) {
        return Observable.throw(error.json().error || 'Server error');
    }
}
