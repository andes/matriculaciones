// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter } from '@angular/core';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

// Services
import { ProfesionalService } from './../../../services/profesional.service';
import { NumeracionMatriculasService } from './../../../services/numeracionMatriculas.service';

@Component({
    selector: 'app-formacion-posgrado-detalle',
    templateUrl: 'formacion-posgrado-detalle.html'
})
export class FormacionPosgradoDetalleComponent {

    @Input() formacion: any;

    constructor(private _profesionalService: ProfesionalService) { }
}
