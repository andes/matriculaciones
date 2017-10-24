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

    @Input() profesional: IProfesional;
    @Output() formacionPosgradoSelected = new EventEmitter();
    @Output() updateProfesional = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profesionalService: ProfesionalService,) {}

    saveProfesional(formacionPosgradoEntrante: any) {

        console.log(formacionPosgradoEntrante)
        console.log(this.profesional.formacionPosgrado)
        console.log(this.profesional)
        //this.profesional.formacionPosgrado.push
        this.profesional.formacionPosgrado.push(formacionPosgradoEntrante);
        this.updateProfesional.emit(this.profesional);
        // let profesionalOperation: any;
        
                    // profesionalOperation = this._profesionalService.saveProfesional(this.profesional);
                    // console.log('ok1');
                    // profesionalOperation.subscribe(resultado => {
                    //     console.log('ok2');
                    // });
    }

    ngOnInit() {

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



    showPosgrado(posgrado: any) {
        this.formacionPosgradoSelected.emit(posgrado);
    }


    borrarPosgrado(i){
        this.profesional.formacionPosgrado.splice(i,1);
        this.updateProfesional.emit(this.profesional);
        
        
    }
    /*getProfesionesProfesional(event: any) {
        return this.profesional.formacionGrado.filter((value) => {
            return value.profesion;
        });
    }*/
}
