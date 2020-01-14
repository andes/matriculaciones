import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';

@Injectable()
export class CambioDniService extends BaseService {

  constructor(_http: HttpClient, private server: Server) {
    super(_http);
  }

  get(): Observable<any> {
    return this.server.get(this.cambioDniUrl);
  }
  saveCambio(cambioDni) {
    return this.server.post(this.cambioDniUrl, cambioDni);
  }

}
