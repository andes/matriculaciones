import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import {
    InfiniteScroll
} from 'angular2-infinite-scroll';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';
import { SIISAService } from '../../services/siisa.service';

@Component({
    selector: 'app-listado-numeracion-matriculas',
    templateUrl: 'listado-numeracion-matriculas.html'
})
export class ListadoNumeracionMatriculasComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public formBuscarNumeracion: FormGroup;
    public numeraciones: any[];
    public numeracionElegida: any;
    public showListado: Boolean = true;
    public var: Number;
    consulta = {
        offset : 0,
        size : 50,
        profesion : null,
        especialidad : null
    };

    constructor(private _numeracionesService: NumeracionMatriculasService,
        private _profesionService: ProfesionService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _siisaSrv: SIISAService) {

        this.numeraciones = [];
    }
    onScroll(event: any) {
        /*this.currentPage++;
        this.updateListado();*/
    }
    ngOnInit() {

        this.formBuscarNumeracion = this._formBuilder.group({
            profesion: new FormControl(),
            especialidad: new FormControl()
        });
        this.buscar();
    }

    showNumeracion(numeracion?: any) {
        this.numeracionElegida = numeracion;
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones().subscribe(
            (profesiones) => {
                console.log(profesiones);
                const list = [{
                    id: '',
                    nombre: 'Todas'
                }].concat(profesiones);

                event.callback(list);
            });
    }

    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(
            (salida: any) => {
                const list = [{
                    id: '',
                    nombre: 'Todas'
                }].concat(salida);

                event.callback(list);
            });

    }

    buscar(event?: any) {
        this._numeracionesService.getNumeraciones(this.consulta)
            .subscribe((resp) => {
                this.numeraciones = resp.data;
                if (event) {
                    event.callback(resp);
                }
            });

            this.showListado = true;
    }

    toggleListado(show) {
        this.showListado = show;
    }

    cambio(ingreso) {
        this.numeracionElegida = ingreso;
    }

    cerrar() {
        this.numeracionElegida = null;
    }


    generarMatricula(event?: any) {
        const numero = this.numeracionElegida.proximoNumero++;
        this._numeracionesService.saveNumeracion(this.numeracionElegida)
            .subscribe(resp => {
            });
    }
}
