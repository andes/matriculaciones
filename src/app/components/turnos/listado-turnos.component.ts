import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { TurnoService } from './../../services/turno.service';


@Component({
    selector: 'app-listado-turnos',
    templateUrl: 'listado-turnos.html'
})
export class ListadoTurnosComponent implements OnInit {
    private formBuscarTurno: FormGroup;
    private turnos: any[] = [];
    private turnoElegido: any;
    private showListado: Boolean = true;

    constructor(private _turnoService: TurnoService,
        private _formBuilder: FormBuilder) { }

    ngOnInit() {

        this.formBuscarTurno = this._formBuilder.group({
            nombre: null,
            apellido: null,
            fecha: null,
            documentoNumero: null
        });
    }

    showTurno(turno: any) {
        this.turnoElegido = turno;
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

    toggleListado(show) {
        this.showListado = show;
    }

    cambiarEstado() {
        this.turnoElegido.sePresento = true;
        this._turnoService.saveTurno(this.turnoElegido)
            .subscribe(resp => {
                //console.log(resp)
            });
    }
}
