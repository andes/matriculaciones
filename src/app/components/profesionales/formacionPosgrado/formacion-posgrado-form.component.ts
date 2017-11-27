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

@Component({
    selector: 'app-formacion-posgrado-form',
    templateUrl: 'formacion-posgrado-form.html'
})
export class FormacionPosgradoFormComponent implements OnInit {
    formPosgrado: FormGroup;
    activeAcc = false;
    profesiones: any[];
    profesionalP: any = {

            profesion: {
                nombre: null,
                codigo: null,
            },
            institucionFormadora: {
                nombre: null,
                codigo: null,
            },
            especialidad: {
                nombre: null,
                codigo: null,
            },
            fechaIngreso: null,
            fechaEgreso: null,
            observacion: null,
            certificacion: {
                fecha: null,
                modalidad: {
                    nombre: null,
                    codigo: null,
                },
                establecimiento: {
                    nombre: null,
                    codigo: null,
                },
            },
            // matriculacion: [{
            //     matriculaNumero: null,
            //     libro: null,
            //     folio: null,
            //     inicio: null,
            //     fin: null,
            //     revalidacionNumero: null,
            // }],
    };

    @Input() profesional: IProfesional;
    @Output() submitPosgrado = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profSrv: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private plex: Plex) {}

    ngOnInit() {
        if (this.profesional) {
            this.profesiones = this.profesional.formacionGrado.map((value) => {
                return value.profesion;
            });
        }
    }

    onSubmit($event, form) {
        if ($event.formValid) {
        this.submitPosgrado.emit(this.profesionalP);
        this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);


        form.resetForm();
        }
    }

    guardarEspecialidad(especialidad: any, valid: boolean) {
        // this.save.emit(especialidad);
    }

    // Selects
    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(event.callback);
    }

    loadModalidadesCertificacion(event: any) {
        this._siisaSrv.getModalidadesCertificacionEspecialidades(null).subscribe(event.callback);
    }

    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    loadEstablecimientosCertificadores(event: any) {
        this._siisaSrv.getEstablecimientosCertificadores(null).subscribe(event.callback);
    }
}
