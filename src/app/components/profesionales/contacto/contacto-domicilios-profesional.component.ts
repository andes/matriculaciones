// Angular
import {
    Component,
    Input,
    OnInit } from '@angular/core';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

@Component({
    selector: 'app-contacto-domicilios-profesional',
    templateUrl: 'contacto-domicilios-profesional.html'
})
export class ContactoDomiciliosProfesionalComponent implements OnInit {

    @Input() profesional: IProfesional;

    ngOnInit() {

    }
}
