import { ProfesionService } from './../../services/profesion.service';
import { BusquedaProfesionalService } from './services/busqueda-profesional.service';
import * as Enums from './../../utils/enumerados';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProfesion } from '../../interfaces/IProfesion';

@Component({
    selector: 'filtros-profesional',
    templateUrl: './filtros-profesional.html'
})

export class FiltrosProfesionalComponent implements OnInit {

    public filtro: any = {};
    public estadosMatriculas: any;
    public profesiones$: Observable<IProfesion[]>;

    constructor(
        private busquedaProfesionalService: BusquedaProfesionalService,
        private profesionService: ProfesionService,
    ) { }

    ngOnInit() {
        this.profesiones$ = this.profesionService.getProfesiones({ gestionaColegio: false });
        this.estadosMatriculas = Enums.getObjEstadosMatriculas();
    }

    filtrar() {
        this.busquedaProfesionalService.lastResults.next(null);
        if (this.filtro.documento) {
            this.busquedaProfesionalService.documentoText.next(this.filtro.documento);
        } else {
            this.busquedaProfesionalService.documentoText.next(null);
        }
        if (this.filtro.nombre) {
            this.busquedaProfesionalService.nombreText.next(this.filtro.nombre);
        } else {
            this.busquedaProfesionalService.nombreText.next(null);
        }
        if (this.filtro.apellido) {
            this.busquedaProfesionalService.apellidoText.next(this.filtro.apellido);
        } else {
            this.busquedaProfesionalService.apellidoText.next(null);
        }
        if (this.filtro.profesion) {
            this.busquedaProfesionalService.profesionSelected.next(this.filtro.profesion);
        } else {
            this.busquedaProfesionalService.profesionSelected.next(null);
        }
        if (this.filtro.numeroMatriculaGrado) {
            this.busquedaProfesionalService.numeroMatriculaGrado.next(this.filtro.numeroMatriculaGrado);
        } else {
            this.busquedaProfesionalService.numeroMatriculaGrado.next(null);
        }
        if (this.filtro.numeroMatriculaEspecialidad) {
            this.busquedaProfesionalService.numeroMatriculaEspecialidad.next(this.filtro.numeroMatriculaEspecialidad);
        } else {
            this.busquedaProfesionalService.numeroMatriculaEspecialidad.next(null);
        }
    }
}
