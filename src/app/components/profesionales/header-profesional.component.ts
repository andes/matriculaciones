// Angular
import {
    Component,
    Input,
    OnInit,
    OnChanges } from '@angular/core';
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

    @Input() profesional: IProfesional;
    constructor(private _profesionalService: ProfesionalService,
         public sanitizer: DomSanitizer,
         public auth: Auth) {

    }
    ngOnInit() {
        this._profesionalService.getProfesionalFirma({firmaAdmin: this.profesional.id})
        .subscribe((respFirmaAdmin) => {
            this.supervisor = respFirmaAdmin.administracion;
        });
        this.agenteMatriculador = this.auth.usuario.nombreCompleto;

        }


}
