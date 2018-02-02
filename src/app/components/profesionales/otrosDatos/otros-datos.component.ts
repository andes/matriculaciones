// Angular
import {
    OnInit,
    Component,
    Input,
    Output,
    EventEmitter } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

// Plex
import { Plex } from '@andes/plex';

// Interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ISiisa } from './../../../interfaces/ISiisa';

// Services
import { SIISAService } from './../../../services/siisa.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from './../../../services/entidadFormadora.service';
import { ProfesionService } from '../../../services/profesion.service';

@Component({
    selector: 'app-otros-datos',
    templateUrl: 'otros-datos.html'
})
export class OtroDatosComponent implements OnInit {
    formPosgrado: FormGroup;
    activeAcc = false;
    otrosDatos: any = {
        matriculaProvincial : null,
        libro : null,
        folio: null,
        anio: null
    };
    @Input() profesional: IProfesional;
    @Output() submitOtrosDatos = new EventEmitter();



    constructor(private _fb: FormBuilder,
        private plex: Plex,
         private _profesionalService: ProfesionalService, ) {}

    ngOnInit() {
    }

    onSubmit($event, form) {

        if ($event.formValid) {
            this.profesional.OtrosDatos = [this.otrosDatos];
         this.submitOtrosDatos.emit(this.otrosDatos);
         console.log(this.profesional)

         }

    }

}
