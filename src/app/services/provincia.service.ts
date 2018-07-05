import { AppSettings } from './../app.settings';
import { IProvincia } from './../interfaces/IProvincia';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
// import { Server } from './../../../node_modules/andes-shared/src/lib/server/server.service';
import 'rxjs/add/operator/toPromise';
import { Server } from '@andes/shared';
import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from './../../environments/environment';

@Injectable()
export class ProvinciaService {

   private provinciaUrl =  '/core/tm/provincias';  // URL to web api

   constructor(private server: Server) {}

//    get(): Observable<IProvincia[]> {
//        return this.http.get(this.provinciaUrl)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

   get(params: any): Observable<IProvincia[]> {
       return this.server.get(this.provinciaUrl);
   }

//    getXPais(pais: String): Observable<IProvincia[]> {
//        return this.http.get(this.provinciaUrl +"?pais=" + pais)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

//     getLocalidades(provincia: String): Observable<IProvincia> {
//     console.log(this.provinciaUrl +"?nombre=" + provincia);
//        return this.http.get(this.provinciaUrl +"?nombre=" + provincia)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

    handleError(error: any) {
         return Observable.throw(error.json().error || 'Server error');
     }

}
