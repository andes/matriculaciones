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
    public renovacionOnline = [];

    constructor(
        private busquedaProfesionalService: BusquedaProfesionalService,
        private profesionService: ProfesionService,
    ) { }

    ngOnInit() {
        this.profesiones$ = this.profesionService.getProfesiones({ gestionaColegio: false });
        this.estadosMatriculas = Enums.getObjEstadosMatriculas();
        this.renovacionOnline = Enums.getObjEstadoRenovacionOnline();
    }

    filtrar() {
        this.busquedaProfesionalService.lastResults.next(null);
        this.busquedaProfesionalService.documentoText.next(this.filtro.documento ? this.filtro.documento : null);
        this.busquedaProfesionalService.nombreText.next(this.filtro.nombre ? this.filtro.nombre : null);
        this.busquedaProfesionalService.apellidoText.next(this.filtro.apellido ? this.filtro.apellido : null);
        this.busquedaProfesionalService.profesionSelected.next(this.filtro.profesion ? this.filtro.profesion : null);
        this.busquedaProfesionalService.numeroMatriculaGrado.next(this.filtro.numeroMatriculaGrado ? this.filtro.numeroMatriculaGrado : null);
        this.busquedaProfesionalService.numeroMatriculaEspecialidad.next(this.filtro.numeroMatriculaEspecialidad ? this.filtro.numeroMatriculaEspecialidad : null);
        this.busquedaProfesionalService.renovacionSelected.next(this.filtro.renovacionOnline ? this.filtro.renovacionOnline.nombre.toLowerCase() : null);
        if (this.filtro.renovacionOnline && this.filtro.renovacionOnline.id !== 'No Aplica') {
            this.busquedaProfesionalService.fechaDesde.next(this.filtro.fechaDesde ? this.filtro.fechaDesde : null);
            this.busquedaProfesionalService.fechaHasta.next(this.filtro.fechaHasta ? this.filtro.fechaHasta : null);
        }
    }
}
