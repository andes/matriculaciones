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

@Component({
    selector: 'app-formacion-posgrado-form',
    templateUrl: 'formacion-posgrado-form.html'
})
export class FormacionPosgradoFormComponent implements OnInit {
    formPosgrado: FormGroup;
    activeAcc = false;
    profesiones: any[];

    @Input() profesional: IProfesional;
    @Output() submitPosgrado = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profSrv: ProfesionalService) {}

    ngOnInit() {
        if (this.profesional) {
            this.profesiones = this.profesional.formacionGrado.map((value) => {
                return value.profesion;
            });
        }
        this.buildForm();
    }

    onSubmit() {
        debugger
        // Validaciones
        if (this.formPosgrado.valid) {

            this.activeAcc = false;
            this.submitPosgrado.emit(this.formPosgrado.value);
            this.buildForm();
        } else {
            // Show errors
        }
    }

    buildForm() {
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
    }

    guardarEspecialidad(especialidad: any, valid: boolean) {
        console.log(valid)
        console.log(especialidad)
        // this.save.emit(especialidad);
    }

    // Selects
    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(event.callback);
    }

    loadModalidadesCertificacion(event: any) {
        this._siisaSrv.getModalidadesCertificacionEspecialidades(null).subscribe(event.callback);
    }

    loadInstitucionesFormadoras(event: any) {
        this._siisaSrv.getEntidadesFormadoras(null).subscribe(event.callback);
    }

    loadEstablecimientosCertificadores(event: any) {
        this._siisaSrv.getEstablecimientosCertificadores(null).subscribe(event.callback);
    }
}
