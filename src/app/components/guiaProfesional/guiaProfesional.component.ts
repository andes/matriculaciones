import { Component, OnInit } from '@angular/core';
import { ProfesionalService } from '../../services/profesional.service';
import * as Enums from './../../utils/enumerados';
import { ProfesionService } from '../../services/profesion.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-guia-profesional',
    templateUrl: 'guiaProfesional.html'
})
export class GuiaProfesionalComponent implements OnInit {

    public guiaProfesionalEnum;
    public filtro;
    public profesionales = [];
    public loading = false;
    public mostrarInfo = false;
    public parametros;
    public busqueda: any = {
        nombre: null,
        apellido: null,
        documento: null,
        formacionGrado: null,
        numeroMatricula: null
    };
    public scanned; // true si se llegó a la guia escaneando qr del profesional
    public columns = [
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: false,
            opcional: false
        },
        {
            key: 'sexo',
            label: 'sexo',
            sorteable: false,
            opcional: true
        },
        {
            key: 'nacionalidad',
            label: 'Nacionalidad',
            sorteable: false,
            opcional: true
        },
        {
            key: 'profesion',
            label: 'Profesión',
            sorteable: false,
            opcional: false
        },
        {
            key: 'matricula',
            label: 'Matrícula',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false
        },
    ];
    constructor(
        private _profesionalService: ProfesionalService,
        private _profesionService: ProfesionService,
        private router: Router) { }

    ngOnInit() {
        this.guiaProfesionalEnum = Enums.getObjGuiaProfesional();
        this.parametros = this.router.parseUrl(this.router.url);
        if (this.router.parseUrl(this.router.url).queryParams['documento']) {
            this.busqueda.documento = this.parametros.queryParams['documento'];
            this.scanned = true;
            this.filtro = {
                'id': 0,
                'nombre': 'Documento'
            };
            this.buscar();
        }
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones({ gestionaColegio: false }).subscribe(event.callback);
    }

    buscar() {
        this.loading = true;
        this.profesionales = [];
        if (this.busqueda.formacionGrado) {
            this.busqueda['codigoProfesion'] = this.busqueda.formacionGrado.codigo;
        }
        this._profesionalService.getGuiaProfesional(this.busqueda).subscribe(resultado => {
            resultado.forEach(profesionalBD => {
                const profesional = {
                    nombre: profesionalBD.nombre,
                    apellido: profesionalBD.apellido,
                    sexo: profesionalBD.sexo,
                    documento: profesionalBD.documento,
                    nacionalidad: profesionalBD.nacionalidad,
                    habilitado: profesionalBD.habilitado,
                    profesiones: []

                };
                profesionalBD.profesiones.forEach(profesion => {
                    const datos = {
                        profesion: profesion.profesion.nombre,
                        matricula: profesion.matriculacion ? profesion.matriculacion[profesion.matriculacion.length -
                            1].matriculaNumero : null,
                        matriculado: profesion.matriculado,
                        matriculaVigente: profesion.matriculacion ? moment(profesion.matriculacion[profesion.matriculacion.length -
                            1].fin).isAfter(moment()) : false,
                    };
                    profesional.profesiones.push(datos);
                });
                profesional.profesiones.length ? this.profesionales.push(profesional) : null;
            });
            this.loading = false;
            this.mostrarInfo = true;
        });
    }


    limpiaFiltro() {
        this.busqueda = {};
        this.profesionales = [];
    }

}
