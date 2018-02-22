import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
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
    selector: 'app-sobre-turno-matriculacion',
    templateUrl: 'sobreTurnoMatriculacion.html'
})
export class SolicitarSobreTurnoMatriculacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public tipoTurno: Enums.TipoTurno;
    private formTurno: FormGroup;
    public turnoSeleccionado: boolean;
    public turnoGuardado: boolean;
    private _turnoSeleccionado: Date;
    public _nuevoProfesional: any;
    public id =  true;

    constructor(private _formBuilder: FormBuilder,
        private _turnosService: TurnoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _pdfUtils: PDFUtils,
        private plex: Plex) {

            this.tipoTurno = Enums.TipoTurno.matriculacion;

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
                const pdf = this._pdfUtils.comprobanteTurno(turno);
                pdf.save('Turno ' + this._nuevoProfesional.nombre + ' ' + this._nuevoProfesional.apellido + '.pdf');
            });
    }

    onProfesionalCompleto(profesional: any) {
        this._turnosService.saveTurnoSolicitados(profesional)
            .subscribe((nuevoProfesional) => {
                if (nuevoProfesional == null) {
                    this.plex.alert('El profesional que quiere agregar ya existe(verificar dni)');
                }else {

                    this._nuevoProfesional = nuevoProfesional;
                    this.turnoGuardado = true;
                    if (this._turnoSeleccionado && this._nuevoProfesional) {
                        this.saveTurno();
                    }
                    this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
                }
        });
    }
}
