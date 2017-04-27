import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';

@Component({
    selector: 'app-numeracion-matriculas',
    templateUrl: 'numeracion-matriculas.html'
})
export class NumeracionMatriculasComponent implements OnInit {
    private formNumeracion: FormGroup;
    @Input() numeracion: any;
    @Output() onShowListado = new EventEmitter();

    constructor(private _numeracionesService: NumeracionMatriculasService,
        private _profesionService: ProfesionService,
        private _formBuilder: FormBuilder) {

    }

    ngOnInit() {
        this.formNumeracion = this._formBuilder.group({
            id: [this.numeracion ? this.numeracion.id : null],
            profesion: [
                this.numeracion ? this.numeracion.profesion : null,
                Validators.required],
            proximoNumero: [
                this.numeracion ? this.numeracion.proximoNumero : null,
                Validators.required]
        });
    }

    guardarNumeracion(model: any) {
        this._numeracionesService.saveNumeracion(model)
            .subscribe((resp) => {
                // console.log(resp);
            });
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones().subscribe(event.callback);
    }

    volverAlListado() {
        this.onShowListado.emit(true);
    }
}
