import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: 'homeAdministracion.html',
    styleUrls: ['homeAdministracion.scss']
})
export class HomeAdministracionComponent implements OnInit {
    public permisosProfesional;
    public permisosTurnos;
    public permisosAgenda;
    public permisosReportes;
    public noTienePermisos;
    constructor(public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        if (this.auth.getPermissions('matriculaciones:profesionales:?').length > 0) {
            this.permisosProfesional = true;
        } else {
            this.permisosProfesional = false;
        }
        if (this.auth.getPermissions('matriculaciones:turnos:?').length > 0) {
            this.permisosTurnos = true;
        } else {
            this.permisosTurnos = false;
        }
        if (this.auth.getPermissions('matriculaciones:agenda:?').length > 0) {
            this.permisosAgenda = true;
        } else {
            this.permisosAgenda = false;
        }
        this.permisosReportes = this.auth.check('matriculaciones:reportes');
        if (!this.permisosProfesional && !this.permisosAgenda && !this.permisosTurnos) {
            this.noTienePermisos = true;
        }

    }

}
