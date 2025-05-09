import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import { Server } from '@andes/shared';

@Injectable()
export class ProfesionalService extends BaseService {
    profesionalesURL = '/core/tm/profesionales/';
    resumenProfesional = '/core/tm/resumen/';
    numeracionesURL = '/modules/matriculaciones/';

    constructor(_http: HttpClient, private server: Server) {
        super(_http);
    }
    getMatriculas(params: any): Observable<any> {
        return this.server.get(this.profesionalesURL + 'matriculas', { params: params, showError: true });
    }
    getProfesional(params: any): Observable<any> {
        return this.server.get(this.profesionalesURL, { params: params, showError: true });
    }
    getProfesionalFoto(params: any): Observable<any> {
        return this.server.get(this.profesionalesURL + 'foto/', { params: params });
    }
    getProfesionalFirma(params: any): Observable<any> {
        return this.server.get(this.profesionalesURL + 'firma/', { params: params });
    }

    saveProfesional(profesionalModel: any) {
        return this.server.post(this.profesionalesURL, profesionalModel);
    }

    updateProfesional(id: String, cambios): Observable<any> {
        return this.server.patch(this.profesionalesURL + 'update/' + id, cambios);
    }

    enviarMail(profesionalModel: any) {
        return this.server.post(this.profesionalesURL + 'sendMail', profesionalModel);
    }
    enviarSms(sms: any) {
        return this.server.post(this.profesionalesURL + 'sms', sms);
    }

    putProfesional(profesionalModel): Observable<any> {
        return this.server.put(this.profesionalesURL + 'actualizar', profesionalModel);
    }

    patchProfesional(id: String, cambios): Observable<any> {
        return this.server.patch(this.profesionalesURL + id, cambios);
    }

    getCredencial(idProf: String): any {
        return this.server.get(this.profesionalesURL + 'matricula/' + idProf);
    }

    getUltimoPosgradoNro(): any {
        return this.server.get(this.numeracionesURL + 'ultimoPosgrado');
    }

    getResumenProfesional(params: any): Observable<any> {
        return this.server.get(this.resumenProfesional, { params: params, showError: true });
    }

    getEstadisticas(): Observable<any> {
        return this.server.get(this.profesionalesURL + 'estadisticas');
    }

    getGuiaProfesional(params): Observable<any> {
        return this.server.get(this.profesionalesURL + 'guia', { params: params, showError: true });
    }

    getProfesionalesSisa(params): Observable<any> {
        return this.server.get(this.profesionalesURL + 'exportSisa', { params: params, showError: true });
    }

    getProfesionalesMatching(params): Observable<any> {
        return this.server.get(this.profesionalesURL + 'matching', { params: params, showError: true });
    }

    getDocumentos(id: String): Observable<any> {
        return this.server.get(this.profesionalesURL + 'documentos/' + id);
    }

    deleteDocumentos(id: String, fileId: String): Observable<any> {
        return this.server.delete(this.profesionalesURL + id + '/documentos/' + fileId, { showError: true });
    }
}


