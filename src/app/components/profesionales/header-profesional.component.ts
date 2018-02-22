// Angular
import {
    Component,
    Input,
    OnInit,
    OnChanges
} from '@angular/core';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../interfaces/IProfesional';
import { DomSanitizer } from '@angular/platform-browser';

import { ProfesionalService } from './../../services/profesional.service';
import { environment } from '../../../environments/environment';
import { Auth } from '@andes/auth';
@Component({
    selector: 'app-header-profesional',
    templateUrl: 'header-profesional.html'
})
export class HeaderProfesionalComponent implements OnInit {
    public foto = null;
    public urlFoto = null;
    public supervisor = null;
    public agenteMatriculador = null;
    public habilitado: any;
    @Input() profesional: IProfesional;
    constructor(private _profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
        public auth: Auth, private plex: Plex) {

    }
    ngOnInit() {
        this.habilitado = this.profesional.habilitado;
        this._profesionalService.getProfesionalFirma({ firmaAdmin: this.profesional.id })
            .subscribe((respFirmaAdmin) => {
                this.supervisor = respFirmaAdmin.administracion;
            });
        this.agenteMatriculador = this.auth.usuario.nombreCompleto;

    }

    habilitar() {
        let mensaje;
        if (this.profesional.habilitado === true) {
            mensaje = '¿Desea dar de baja este profesional?';
        } else {
            mensaje = '¿Desea dar de alta este profesional?';
        }
        this.plex.confirm(mensaje).then((resultado) => {
            if (resultado) {
                this.profesional.habilitado = this.habilitado;
                const cambio = {
                    'op': 'updateHabilitado',
                    'data': this.habilitado,
                    'agente': this.auth.usuario.nombreCompleto
                };

                this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });

            }
        });



    }


}
