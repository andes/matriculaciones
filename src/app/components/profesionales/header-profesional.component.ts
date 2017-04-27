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

@Component({
    selector: 'app-header-profesional',
    templateUrl: 'header-profesional.html'
})
export class HeaderProfesionalComponent {

    @Input() profesional: IProfesional;
}
