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


@Component({
    selector: 'app-formacion-posgrado',
    templateUrl: 'formacion-posgrado.html'
})
export class FormacionPosgradoComponent implements OnInit {
    // formPosgrado: FormGroup;
    profesiones: any[];
    // accordionActive = false;

    @Input() profesional: IProfesional;
    @Output() formacionPosgradoSelected = new EventEmitter();
    @Output() updateProfesional = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService) {}

    saveProfesional(formacionPosgrado: any) {
        debugger
        console.log(formacionPosgrado)
        this.profesional.formacionPosgrado.push(formacionPosgrado);
        this.updateProfesional.emit(this.profesional);
    }

    ngOnInit() {

        /*if (this.profesional) {
            this.profesiones = this.profesional.formacionGrado.map((value) => {
                return value.profesion;
            });
        }*/
        // this.cleanForm();
    }

    /*cleanForm() {
        this.formPosgrado = this._fb.group({
            profesion: [null, Validators.required],
            especialidad: [null, Validators.required],
            institucionFormadora: [null, Validators.required],
            fechaIngreso: [null, Validators.required],
            fechaEgreso: [null, Validators.required],
            certificacion: this._fb.group({
                fecha: null,
                modalidad: null,
                establecimiento: null
            }),
            numero: null,
            libro: null,
            folio: null,
            revalida: null,
        });
    }*/

    /*guardarEspecialidad(especialidad: any) {
        const dIng = new Date(especialidad.fechaIngreso);
        const dEgr = new Date(especialidad.fechaEgreso);
        const dCert = new Date(especialidad.certificacion.fecha);

        if (dIng > dEgr) {
            // Error.
        }



        this.accordionActive = false;
        this.save.emit(especialidad);
    }*/

    showPosgrado(posgrado: any) {
        this.formacionPosgradoSelected.emit(posgrado);
    }
    /*getProfesionesProfesional(event: any) {
        return this.profesional.formacionGrado.filter((value) => {
            return value.profesion;
        });
    }*/
}
