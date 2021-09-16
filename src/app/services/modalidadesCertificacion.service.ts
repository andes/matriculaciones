import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Server } from '@andes/shared';

@Injectable()
export class ModalidadesCertificacionService extends BaseService {

    // private entidadesFormadorasUrl = this.siisaURL + '/entidadesFormadoras';
    constructor(_http: HttpClient, private server: Server) {
        super(_http);
    }
    getModalidadesCertificacion() {
        return this.server.get(this.modalidadesCertificacionURL);
    }
}
