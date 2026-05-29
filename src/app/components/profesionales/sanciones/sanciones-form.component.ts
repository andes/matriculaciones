import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { IProfesional } from './../../../interfaces/IProfesional';
@Component({
    selector: 'app-sanciones-form',
    templateUrl: 'sanciones-form.html',
    styleUrls: ['sanciones.scss']
})
export class SancionesFormComponent implements OnInit {
    activeAcc: Boolean = false;
    sancionesTipo = [{
        nombre: 'Apercibimiento',
        id: 1
    }, {
        nombre: 'Baja de Matrícula',
        id: 2
    }, {
        nombre: 'Multa',
        id: 3
    }, {
        nombre: 'Suspensión',
        id: 4
    }];
    public hoy = moment().endOf('day').toDate();

    @Input() profesional: IProfesional;
    @Output() submitSancion = new EventEmitter();
    sanciones: any = this.createSancionModel();
    constructor(private plex: Plex) { }

    ngOnInit() {
    }

    get maximoFecha() {
        return this.sanciones.vencimiento ? moment(this.sanciones.vencimiento).subtract(1, 'day').startOf('day').toDate() : this.hoy;
    }

    get minimoVencimiento() {
        return this.sanciones.fecha ? moment(this.sanciones.fecha).add(1, 'day').startOf('day').toDate() : null;
    }

    onSave($event, form) {
        if ($event.formValid) {
            this.submitSancion.emit({
                ...this.sanciones,
                sancion: this.sanciones.sancion ? { ...this.sanciones.sancion } : null
            });
            this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
            this.sanciones = this.createSancionModel();
            form.resetForm(this.sanciones);
        }
    }

    private createSancionModel() {
        return {
            numero: null,
            sancion: null,
            motivo: null,
            normaLegal: null,
            fecha: null,
            vencimiento: null,
        };
    }

    loadTipoSanciones(event: any) {
        const sanciones = [{
            nombre: 'Apercibimiento',
            id: 1
        }, {
            nombre: 'Baja de Matrícula',
            id: 2
        }, {
            nombre: 'Multa',
            id: 3
        }, {
            nombre: 'Suspensión',
            id: 4
        }];

        event.callback(sanciones);
    }
}
