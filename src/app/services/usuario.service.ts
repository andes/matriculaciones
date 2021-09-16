import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server, cache } from '@andes/shared';
import { Auth } from '@andes/auth';
import { throwError } from 'rxjs';

@Injectable()
export class UsuarioService {

    private usuarioUrl = '/modules/gestor-usuarios/usuarios'; // URL to web api

    constructor(
        private server: Server,
        private auth: Auth
    ) { }

    private me$: Observable<any>;
    me(): Observable<any> {
        if (this.auth.usuario) {
            if (this.me$) {
                return this.me$;
            }
            this.me$ = this.get(this.auth.usuario.documento, '-organizaciones').pipe(
                cache() // Desde donde se llame, solo se va a ejecutar una vez.
            );
            return this.me$;
        } else {
            return throwError(new Error('not_loggin'));
        }
    }

    get(id, fields = null): Observable<any> {
        return this.server.get(`${this.usuarioUrl}/${id}`, { params: { fields } });
    }

    find(query = {}): Observable<any> {
        return this.server.get(this.usuarioUrl, { params: query });
    }

    create(body): Observable<any> {
        return this.server.post(this.usuarioUrl, body);
    }

    update(id, body): Observable<any> {
        return this.server.patch(`${this.usuarioUrl}/${id}`, body);
    }

    delete(id): Observable<any> {
        return this.server.delete(`${this.usuarioUrl}/${id}`);
    }

    ldap(id: String): Observable<any> {
        return this.server.get(`${this.usuarioUrl}/ldap/${id}`);
    }

    addOrganizacion(id, organizacion, body) {
        return this.server.post(`${this.usuarioUrl}/${id}/organizaciones/${organizacion}`, body);
    }

    updateOrganizacion(id, organizacion, body): Observable<any> {
        return this.server.patch(`${this.usuarioUrl}/${id}/organizaciones/${organizacion}`, body);
    }

    deleteOrganizacion(id, organizacion): Observable<any> {
        return this.server.delete(`${this.usuarioUrl}/${id}/organizaciones/${organizacion}`);
    }

}
