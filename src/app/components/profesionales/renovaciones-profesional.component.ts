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
    selector: 'app-renovaciones-profesional',
    templateUrl: 'renovaciones-profesional.html'
})
export class RenovacionesProfesionalComponent {

    @Input() profesional: IProfesional;
}
