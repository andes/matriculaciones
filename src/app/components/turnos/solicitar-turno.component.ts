import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { ProfesionalService } from './../../services/profesional.service';
import { TurnoService } from './../../services/turno.service';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';
import * as Enums from './../../utils/enumerados';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-solicitar-turno',
    templateUrl: 'solicitar-turno.html'
})
export class SolicitarTurnoComponent implements OnInit, OnChanges {
    formRematriculacion: FormGroup;
    tipoTurno: Enums.TipoTurno;
    turnoSeleccionado: Date;

    constructor(private _formBuilder: FormBuilder) { }

    ngOnInit() {
        this.formRematriculacion = this._formBuilder.group({
            documento: [null, Validators.required],
            matriculaNumero: [null, Validators.required]
        });
    }

    ngOnChanges() {
    }

    nuevaMatriculacion() {
        this.tipoTurno = Enums.TipoTurno.matriculacion;
    }

    buscarProfesional(form: any) {
        this.tipoTurno = Enums.TipoTurno.renovacion;
    }

    onTurnoSeleccionado(turno: Date) {
        this.turnoSeleccionado = turno;
    }
}
