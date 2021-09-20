import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';
import { SIISAService } from '../../services/siisa.service';

@Component({
    selector: 'app-numeracion-form-matriculas',
    templateUrl: 'numeracion-matriculas-form.html'
})
export class NumeracionMatriculasFormComponent implements OnInit {
    public formNumeracion: FormGroup;
    public numeracionMatricula: any = {
        profesion: null,
        proximoNumero: null
    };
    @Output() saveNumeracion = new EventEmitter();


    constructor(private _numeracionesService: NumeracionMatriculasService,
                private _profesionService: ProfesionService,
                private _formBuilder: FormBuilder,
                private plex: Plex,
                private _siisaSrv: SIISAService) {

    }

    ngOnInit() {

    }

    guardarNumeracion($event, tipo) {

        if ($event.formValid) {
            if (tipo === 'prof') {
                this.numeracionMatricula.especialidad = null;
            }
            if (tipo === 'esp') {
                this.numeracionMatricula.profesion = null;
            }
            this._numeracionesService.saveNumeracion(this.numeracionMatricula)
                .subscribe((resp) => {
                    if (!resp) {
                        this.plex.info('info', 'Ya existe esta profesion/especialidad con una numeracion asignada');

                    } else {
                        this.plex.toast('success', 'Se guardo con exito!', 'informacion', 1000);
                        this.saveNumeracion.emit(null);
                    }

                });
        }
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones({habilitado : true}).subscribe(event.callback);
    }

    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(event.callback);
    }

    volverAlListado() {

    }
}
