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
@Component({
    selector: 'app-header-profesional',
    templateUrl: 'header-profesional.html'
})
export class HeaderProfesionalComponent implements OnInit, OnChanges {
   public foto = null;
    public urlFoto = null;
    @Input() img64 = null;
    @Input() profesional: IProfesional;
    constructor(private _profesionalService: ProfesionalService, public sanitizer: DomSanitizer) {

    }
    ngOnInit() {

         this.urlFoto = environment.API + '/core/tm/profesionales/foto/' + this.profesional.id;

        }

     ngOnChanges () {
         if (this.img64 !== null) {
         this.urlFoto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.img64);
         }
    }

}
