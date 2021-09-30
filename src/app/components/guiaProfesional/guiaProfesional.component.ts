import { Component, OnInit } from '@angular/core';
import { ProfesionalService } from '../../services/profesional.service';
import * as Enums from './../../utils/enumerados';
import { ProfesionService } from '../../services/profesion.service';

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
    public busqueda: any = {
        nombre: null,
        apellido: null,
        documento: null,
        formacionGrado: null,
        numeroMatricula: null
    };
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
        private _profesionService: ProfesionService) { }

    ngOnInit() {
        this.guiaProfesionalEnum = Enums.getObjGuiaProfesional();
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones({gestionaColegio : false}).subscribe(event.callback);
    }

    buscar() {
        this.loading = true;
        this.profesionales = [];
        if (this.busqueda.formacionGrado) {
            this.busqueda['codigoProfesion'] = this.busqueda.formacionGrado.codigo;
        }
        this._profesionalService.getGuiaProfesional(this.busqueda).subscribe(resultado => {
            resultado.forEach(profesional => {
                profesional.profesiones.forEach(profesion => {
                    const datos = {
                        nombre: profesional.nombre,
                        apellido: profesional.apellido,
                        sexo: profesional.sexo,
                        documento: profesional.documento,
                        nacionalidad: profesional.nacionalidad,
                        profesion: profesion.profesion.nombre,
                        matricula: profesion.matriculacion[profesion.matriculacion.length -
              1].matriculaNumero,
                        matriculado: profesion.matriculado
                    };
                    this.profesionales.push(datos);
                });
            });
            this.loading = false;
            this.mostrarInfo = true;
        });
    }

    limpiaFiltro() {
        this.busqueda = {};
    }

}
