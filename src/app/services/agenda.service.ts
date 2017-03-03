import { AppSettings } from './../app.settings';
import { IAgendaMatriculaciones } from './../interfaces/IAgendaMatriculaciones';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AgendaService {

   private agendaUrl = AppSettings.API_ENDPOINT + '/modules/matriculaciones/agendaMatriculaciones';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<IAgendaMatriculaciones[]> {
       return this.http.get(this.agendaUrl)
           .map((res: Response) => res.json())
           .catch(this.handleError); // ...errors if any*/
   }

   save(agenda: any): Observable<IAgendaMatriculaciones> {

        if (agenda.id) {
            return this.http.put(this.agendaUrl + '/' + agenda.id, agenda)
                    .map((res: Response) => res.json())
                    .catch(this.handleError);
        } else {
            return this.http.post(this.agendaUrl, agenda)
                    .map((res: Response) => res.json())
                    .catch(this.handleError);
        }
   }

  handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }   
}