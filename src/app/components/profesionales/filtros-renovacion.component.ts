import { BusquedaProfesionalService } from './services/busqueda-profesional.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProfesion } from '../../interfaces/IProfesion';
import { ZonaSanitariaService } from 'src/app/services/zonaSanitaria.service';
import * as moment from 'moment';

@Component({
    selector: 'filtros-renovacion',
    templateUrl: './filtros-renovacion.html'
})

export class FiltrosRenovacionComponent implements OnInit {

    public filtro: any = {};
    public estadosMatriculas: any;
    public profesiones$: Observable<IProfesion[]>;
    public zonasSanitarias = [];

    constructor(
        private busquedaProfesionalService: BusquedaProfesionalService,
        private zonaSanitariaService: ZonaSanitariaService
    ) { }

    get inicioDelDia(){
        return moment().startOf('day').toDate();
    }

    get finDelDia(){
        return moment().endOf('day').toDate();
    }

    ngOnInit() {
        this.zonaSanitariaService.search().subscribe(data => this.zonasSanitarias = data);
    }

    filtrar() {
        this.busquedaProfesionalService.lastResults.next(null);
        if (this.filtro.fechaDesde) {
            this.busquedaProfesionalService.fechaDesde.next(this.filtro.fechaDesde);
        } else {
            this.busquedaProfesionalService.fechaDesde.next(this.inicioDelDia);
        }
        if (this.filtro.fechaHasta) {
            this.busquedaProfesionalService.fechaHasta.next(this.filtro.fechaHasta);
        } else {
            this.busquedaProfesionalService.fechaHasta.next(this.finDelDia);
        }
        if (this.filtro.zonaSanitaria) {
            this.busquedaProfesionalService.zonaSanitaria.next(this.filtro.zonaSanitaria);
        } else {
            this.busquedaProfesionalService.zonaSanitaria.next(null);
        }
    }
}
