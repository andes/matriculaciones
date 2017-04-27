import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

// Services
import { TurnoService } from './../../services/turno.service';

import { PDFUtils } from './../../utils/PDFUtils';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-turnos',
    templateUrl: 'turnos.html'
})
export class TurnosComponent implements OnInit {
    private formBuscarTurno: FormGroup;
    private turnos: any[] = [];
    private turnoElegido: any;
    private showListado: Boolean = true;

    constructor(private _turnoService: TurnoService,
        private _formBuilder: FormBuilder,
        private _pdfUtils: PDFUtils,
        private route: ActivatedRoute,
        private router: Router) { }

    onScroll() {
        console.log('scroll');
    }

    ngOnInit() {
        
        this.formBuscarTurno = this._formBuilder.group({
            nombre: '',
            apellido: '',
            fecha: null,
            documentoNumero: ''
        });

        this.buscar();
    }

    showTurno(turno: any) {
        this.turnoElegido = turno;
    }

    isSelected(turno: any) {
        return this.turnoElegido && turno.id === this.turnoElegido.id;
    }

    buscar(event?: any) {

        if (!event) {
            this.turnoElegido = null;
        }

        const consulta = this.formBuscarTurno.value;
        consulta.offset = event ? event.query.offset : 0;
        consulta.size = event ? event.query.size : 10;

        this._turnoService.getTurnosProximos(consulta)
            .subscribe((resp) => {

                this.turnos = resp.data;

                if (event) {
                    event.callback(resp);
                }
            });
    }

    showProfesional(turno: any) {
        this.router.navigate(['/profesional', turno.profesional.id]);
    }

    cambiarEstado() {
        this.turnoElegido.sePresento = true;
        this._turnoService.saveTurno(this.turnoElegido)
            .subscribe(resp => {
                //console.log(resp)
            });
    }

    generarComprobante(turno: any) {
        const pdf = this._pdfUtils.comprobanteTurno(turno);
        pdf.save('Turno ' + turno.profesional.nombre + ' ' + turno.profesional.apellido + '.pdf');
    }
}
