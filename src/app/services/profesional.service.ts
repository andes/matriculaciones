import { Injectable } from '@angular/core';
import { AppSettings } from './../app.settings';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { Http, URLSearchParams } from '@angular/http';
import { IProfesional } from './../interfaces/IProfesional';
import { Server } from '@andes/shared';

@Injectable()
export class ProfesionalService extends BaseService {
    profesionalesURL = AppSettings.API_ENDPOINT + '/core/tm/profesionales/';

    constructor(_http: Http, private server: Server) {
        super(_http);
    }

    saveProfesional(profesionalModel: any) {
        return this.server.post(this.profesionalesURL, profesionalModel);
    }

    saveProfesionalFoto(foto: any) {
        return this.server.post(this.profesionalesURL + 'foto' , {foto});
    }

    getProfesionalFirma(id: string = null): Observable<any> {
        return this.server.get(this.profesionalesURL + 'firma/' , { params: id, showError: true });
    }

    saveProfesionalFirma(firma: any) {
        return this.server.post(this.profesionalesURL + 'firma' , {firma});
    }

    getProfesionalFoto(id: string = null): Observable<any> {
        return this.server.get(this.profesionalesURL + 'foto/' , { params: id, showError: true });
    }

    getProfesional(params: any): Observable<any> {
        return this.server.get(this.profesionalesURL, { params: params, showError: true });
    }

    getUnProfesional(id: string = null): Observable<any> {
        return this.getById(this.profesionalesURL, id);
    }
    getUnProfesionalDni(dni: any): Observable<any> {
        return this.server.get(this.profesionalesURL + 'traePDni/' + dni);
    }

    putProfesional(profesionalModel): Observable<any> {

        return this.server.post(this.profesionalesURL + 'actualizar', profesionalModel);
    }


    getCredencial(idProf: string): any {
        return this.server.get(this.profesionalesURL + 'matricula/' + idProf);
    }

    // getProfesionales(url: string, searchParams: any): Observable<any> {
    //     const query = new URLSearchParams();

    //     if (searchParams.documentoNumero) {
    //         query.set('documentoNumero', searchParams.documentoNumero);
    //     }
    //     return this.get(url, query);
    // }
}


