import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

// Services
import { TurnoService } from './../../services/turno.service';

import { PDFUtils } from './../../utils/PDFUtils';
import { Auth } from '@andes/auth';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-turnos',
    templateUrl: 'turnos.html',
    styleUrls: ['turnos.scss']
})
export class TurnosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    private formBuscarTurno: FormGroup;
    private turnos: any[] = [];
    private turnoElegido: any;
    private showListado: Boolean = true;
    offset = 0;
    limit = 10;
    turnosTotal = null;

    constructor(private _turnoService: TurnoService,
        private _formBuilder: FormBuilder,
        private _pdfUtils: PDFUtils,
        private route: ActivatedRoute,
        private router: Router,
        public auth: Auth) { }

    onScroll() {
    }

    ngOnInit() {
        this.formBuscarTurno = this._formBuilder.group({
            nombre: '',
            apellido: '',
            fecha: null,
            documento: ''
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
        consulta.offset = event ? event.query.offset : this.offset;
        consulta.size = event ? event.query.size : this.limit;

        this._turnoService.getTurnosProximos(consulta)
            .subscribe((resp) => {
                this.turnos = resp.data;
                if (event) {

                    event.callback(resp);
                }


            const consultaTotal = this.formBuscarTurno.value;
            consultaTotal.offset = event ? event.query.offset : null;
            consultaTotal.size = event ? event.query.size : null;

            this._turnoService.getTurnosProximos(consultaTotal)
                .subscribe((res) => {
                    this.turnosTotal = res.data.length;
                    if (event) {

                        event.callback(res);
                    }
                });
            });

    }

    showProfesional(turno: any) {
        this.router.navigate(['/profesional', turno.profesional.documento]);
    }

    cambiarEstado() {
        this.turnoElegido.sePresento = true;
        this._turnoService.saveTurno(this.turnoElegido)
            .subscribe(resp => {
            });
    }

    generarComprobante(turno: any) {
        const pdf = this._pdfUtils.comprobanteTurno(turno);
        pdf.save('Turno ' + turno.profesional.nombre + ' ' + turno.profesional.apellido + '.pdf');
    }

    cerrarDetalleTurno() {
        this.turnoElegido = null;
    }

    nextPage() {
        this.limit += 10;
        this.buscar();
    }


}
