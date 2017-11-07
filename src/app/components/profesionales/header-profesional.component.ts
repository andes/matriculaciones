// Angular
import {
    Component,
    Input } from '@angular/core';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../interfaces/IProfesional';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-header-profesional',
    templateUrl: 'header-profesional.html'
})
export class HeaderProfesionalComponent {
   public foto = null;

    @Input() profesional: IProfesional;

    constructor(public sanitizer: DomSanitizer) {

    }
    ngOnInit() {
        this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.profesional.fotoArchivo);
    }
}
