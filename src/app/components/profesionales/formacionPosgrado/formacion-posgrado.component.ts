// Angular
import {
    Component,
    OnInit,
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

@Component({
    selector: 'app-formacion-posgrado',
    templateUrl: 'formacion-posgrado.html'
})
export class FormacionPosgradoComponent implements OnInit {
    // formPosgrado: FormGroup;
    profesiones: any[];
    // accordionActive = false;
    public resultado: boolean;

    @Input() profesional: IProfesional;
    @Output() formacionPosgradoSelected = new EventEmitter();
    @Output() updateProfesional = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profesionalService: ProfesionalService,
        private plex: Plex) {}

    saveProfesional(formacionPosgradoEntrante: any) {
        if (this.profesional.formacionPosgrado) {
            this.profesional.formacionPosgrado.push(formacionPosgradoEntrante);
        } else {
            this.profesional.formacionPosgrado = [formacionPosgradoEntrante];
        }

        this.updateProfesional.emit(this.profesional);

    }

    ngOnInit() {

    }




    showPosgrado(posgrado: any) {
        this.formacionPosgradoSelected.emit(posgrado);
    }


    borrarPosgrado(i) {
         this.profesional.formacionPosgrado.splice(i, 1);
         this.updateProfesional.emit(this.profesional);
    }


    confirm(i) {
        this.plex.confirm('¿Desea eliminar?').then((resultado) => {
            if (resultado) {
            this.borrarPosgrado(i);
            }
        });
    }
}
