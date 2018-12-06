import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
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
import * as moment from 'moment';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';
import * as Enums from './../../utils/enumerados';
import { Router } from '@angular/router';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-solicitar-turno-matriculacion',
    templateUrl: 'solicitar-turno-matriculacion.html'
})
export class SolicitarTurnoMatriculacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public tipoTurno: Enums.TipoTurno;
    private formTurno: FormGroup;
    public turnoSeleccionado: boolean;
    public turnoGuardado: boolean;
    private _turnoSeleccionado: Date;
    public _nuevoProfesional: any;

    constructor(private _formBuilder: FormBuilder,
        private _turnosService: TurnoService,
        private router: Router,
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

        this._turnosService.saveTurnoMatriculacion({ turno: this.formTurno.value })
            .subscribe(turno => {
                const pdf = this._pdfUtils.comprobanteTurno(turno);
                pdf.save('Turno ' + this._nuevoProfesional.nombre + ' ' + this._nuevoProfesional.apellido + '.pdf');
            });
    }

    onProfesionalCompleto(profesional: any) {

        const parametros = {
            documento: profesional.documento,
            tipoTurno: 'matriculacion',
            sexo: profesional.sexo
        };
        console.log(profesional.sexo);
        this._turnosService.getTurnosPorDocumento(parametros).subscribe((resultado: any) => {
            console.log(resultado);
            if (resultado.length === 0) {
                this._turnosService.saveTurnoSolicitados(profesional)
                    .subscribe((nuevoProfesional) => {
                        if (nuevoProfesional == null) {
                            this.plex.alert('El profesional que quiere agregar ya existe(verificar dni)');
                        } else {

                            this._nuevoProfesional = nuevoProfesional;
                            this.turnoGuardado = true;
                            if (this._turnoSeleccionado && this._nuevoProfesional) {
                                this.saveTurno();
                            }
                            this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
                            this.router.navigate(['requisitosGenerales']);
                        }
                    });
            } else {
                this.plex.alert('usted ya tiene un turno para el dia <strong>' + moment(resultado[0].fecha).format('DD MMMM YYYY, h:mm a' + '</strong>'));
                // this.router.navigate(['requisitosGenerales']);
            }
        });
    }
}
