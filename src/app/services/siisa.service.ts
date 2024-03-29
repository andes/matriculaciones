import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

import { ISiisa } from '../interfaces/ISiisa';

@Injectable()
export class SIISAService {
    private siisaUrl = '/core/tm/siisa'; // URL to web api

    constructor(private server: Server) { }

    getEspecialidades(id: String): Observable<ISiisa[]> {
        // TODO: buscar Por id
        return this.server.get(this.siisaUrl + '/especialidad', null);
    }

    getModalidadesCertificacionEspecialidades(id: String): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/modalidadesCertificacion', null);
    }

    getEntidadesFormadoras(id: String): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/entidadesFormadoras', null);
    }

    getEstablecimientosCertificadores(id: String): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/establecimientosCertificadores', null);
    }
    getProfesiones(): Observable<ISiisa[]> {
        return this.server.get(this.siisaUrl + '/profesion', null);
    }

}
