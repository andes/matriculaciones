import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { IProfesional } from './../interfaces/IProfesional';

@Injectable()
export class ProfesionalService extends BaseService {

    constructor(_http: Http) {
        super(_http);
    }

    saveProfesional(profesionalModel: any){
        return this.post(this.profesionalesURL, profesionalModel);
    }

    getProfesional(id: string = null): Observable<IProfesional> {
        return this.getById(this.profesionalesURL, id);
    }

    getCredencial(idProf: string): any {
        return this.get(this.profesionalesURL + 'matricula/' + idProf);
    }
}
