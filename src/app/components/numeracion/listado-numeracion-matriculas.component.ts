import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';

@Component({
    selector: 'app-listado-numeracion-matriculas',
    templateUrl: 'listado-numeracion-matriculas.html'
})
export class ListadoNumeracionMatriculasComponent implements OnInit {
    private formBuscarNumeracion: FormGroup;
    private numeraciones: any[];
    private numeracionElegida: any;
    private showListado: Boolean = true;

    constructor(private _numeracionesService: NumeracionMatriculasService,
        private _profesionService: ProfesionService,
        private _formBuilder: FormBuilder,
        private _router: Router) {

            this.numeraciones = [];
    }

    ngOnInit() {
        this.formBuscarNumeracion = this._formBuilder.group({
            profesion: new FormControl()
        });
    }

    showNumeracion(numeracion?: any) {
        this.numeracionElegida = numeracion;
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones().subscribe(
            (profesiones) => {
                const list = [{
                    id: '',
                    nombre: 'Todas'
                }].concat(profesiones);

                event.callback(list);
            });
    }

    buscar(event?: any) {

        const consulta = this.formBuscarNumeracion.value;

        if (consulta.profesion && consulta.profesion.nombre === 'Todas') {
            consulta.profesion = null;
        }

        consulta.offset = event ? event.query.offset : 0;
        consulta.size = event ? event.query.size : 10;

        if (!event) {
            this.numeracionElegida = null;
        }

        this._numeracionesService.getNumeraciones(consulta)
            .subscribe((resp) => {
                this.numeraciones = resp.data;
                if (event) {
                    event.callback(resp);
                }
            });
    }

    toggleListado(show) {
        this.showListado = show;
    }


    generarMatricula(event?: any) {
        const numero = this.numeracionElegida.proximoNumero++;
        this._numeracionesService.saveNumeracion(this.numeracionElegida)
            .subscribe(resp => {
                // console.log('Matrícula Generada');
            });
    }
}
