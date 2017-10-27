import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
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
    selector: 'app-solicitar-turno-renovacion',
    templateUrl: 'solicitar-turno-renovacion.html'
})
export class SolicitarTurnoRenovacionComponent implements OnInit {
    public tipoTurno: Enums.TipoTurno;
    private formTurno: FormGroup;
    public turnoSeleccionado: boolean;
    public turnoGuardado: boolean;
    private _turnoSeleccionado: Date;
    private _profesionalID: string;
    public _nuevoProfesional: any;

    constructor(private _formBuilder: FormBuilder,
        private _turnosService: TurnoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _pdfUtils: PDFUtils) {

            this.tipoTurno = Enums.TipoTurno.renovacion;

         }

    ngOnInit() {

    }

    onTurnoSeleccionado(turno: Date) {
        this._turnoSeleccionado = turno;
        this.turnoSeleccionado = true;
    }

    saveTurno() {

        this.formTurno = this._formBuilder.group({
            fecha: this._turnoSeleccionado,
            tipo: this.tipoTurno,
            profesional: this._nuevoProfesional._id
        });

        this._turnosService.saveTurnoMatriculacion(this.formTurno.value)
            .subscribe(turno => {
                console.log(turno)
                const pdf = this._pdfUtils.comprobanteTurno(turno);
                pdf.save('Turno ' + this._nuevoProfesional.nombre + ' ' + this._nuevoProfesional.apellido + '.pdf');
            });
    }

    onProfesionalCompleto(profesional: any) {
        this._profesionalService.saveProfesional(profesional)
            .subscribe((nuevoProfesional) => {
                this._nuevoProfesional = nuevoProfesional;
                this.turnoGuardado = true;

                if (this._turnoSeleccionado && this._nuevoProfesional) {
                    this.saveTurno();
                }
        });
    }
}
