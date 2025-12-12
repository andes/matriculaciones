import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { SIISAService } from '../../services/siisa.service';
import { ISiisa } from '../../interfaces/ISiisa';
import { ProfesionalService } from '../../services/profesional.service';
import { ExcelService } from '../../services/excel.service';
import * as enumerados from '../../utils/enumerados';
import { ISubscription } from 'rxjs/Subscription';
import { Plex } from '@andes/plex';
import { of, Observable } from 'rxjs';
import * as moment from 'moment';
import { getObjEstadosMatriculas } from './../../utils/enumerados';

const limit = 20;
@Component({
    selector: 'app-reportes',
    templateUrl: 'reportes.html',
    styleUrls: ['reportes.scss']
})

export class ReportesComponent implements OnInit {
    public busquedaMatriculasProxAVencer = false;
    public fechaMatriculacionDesde: Date;
    public fechaMatriculacionHasta: Date;
    public fechaVencimientoDesde: Date;
    public fechaVencimientoHasta: Date;
    public mostrarMasOpciones = false;
    public profesiones: ISiisa[] = [];
    public especialidades: ISiisa[] = [];
    public profesion: any;
    public especialidad: any;
    public matriculasBaja = false;
    public matriculasVencidas = false;
    public loader = false;
    public profesionales: any[];
    public deshabilitarExportar = false;
    public selectData = enumerados.getTiposMatricula();
    public select = this.selectData[0];
    private skip = 0;
    private tengoDatos = true;
    public finScroll = false;
    public resultado = [];
    private lastRequest: ISubscription;
    public estadosMatriculas;
    public estado;
    public isCollapsed = false;
    private selectSnapshot: any;
    public columns = [
        {
            key: 'profesional',
            label: 'Apellido y nombre',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => {
                const nameA = `${a.apellido} ${a.nombre}`;
                const nameB = `${b.apellido} ${b.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'nacimiento',
            label: 'Nacimiento',
            sorteable: false,
            opcional: true
        },
        {
            key: 'profesion',
            label: 'Profesión',
            sorteable: false,
            opcional: true
        },
        {
            key: 'especialidad',
            label: 'Especialidad',
            sorteable: false,
            opcional: true
        },
        {
            key: 'matriculacion',
            label: 'Fecha de matriculación',
            sorteable: false,
            opcional: true
        },
        {
            key: 'numero',
            label: 'Número',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false
        }
    ];
    profesionales$: Observable<any>;

    constructor(
        private auth: Auth,
        private router: Router,
        private siisaService: SIISAService,
        private profesionalService: ProfesionalService,
        private excelService: ExcelService,
        private _plex: Plex
    ) { }

    ngOnInit() {
        if (!this.auth.check('matriculaciones:reportes')) {
            this.router.navigate(['inicio']);
        }
        this.siisaService.getProfesiones().subscribe(res => {
            this.profesiones = res;
        });
        this.siisaService.getEspecialidades(null).subscribe(res => {
            this.especialidades = res;
        });
        this.estadosMatriculas = getObjEstadosMatriculas();
        this.estado = this.estadosMatriculas[0];
    }

    public changeCollapse(event) {
        this.isCollapsed = event;
    }
    public onChange() {
        this.fechaMatriculacionDesde = null;
        this.fechaMatriculacionHasta = null;
        this.fechaVencimientoDesde = null;
        this.fechaVencimientoHasta = null;
        this.matriculasVencidas = false;
    }
    public onChangeVencidas() {
        this.fechaVencimientoDesde = null;
        this.fechaVencimientoHasta = null;
        this.busquedaMatriculasProxAVencer = false;
    }
    public onChangeBaja() {
        this.fechaVencimientoDesde = null;
        this.fechaVencimientoHasta = null;
    }

    public generarReporte(exportarPlantilla: boolean) {
        this.loader = true;
        this.deshabilitarExportar = exportarPlantilla;
        this.selectSnapshot = this.select; // Guardar el valor actual del select
        this.loadDatos(exportarPlantilla, false);
    }

    onScroll(event: Event) {
        const target = event.target as HTMLElement;
        const atBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
        if (atBottom && this.tengoDatos && !this.loader) {
            this.skip += limit;
            this.loadDatos(false, true);
        }
    }

    private loadDatos(exportarPlantilla: boolean, concatenar = false) {
        if (!this.select) {
            this.loader = false;
            this._plex.info('info', 'Seleccione un tipo de matrícula', 'Tipo de matrícula requerido');
            return;
        }
        if (!concatenar) {
            this.profesionales = [];
            this.skip = 0;
        }
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
        if (this.fechaMatriculacionDesde) {
            this.fechaMatriculacionDesde = moment(this.fechaMatriculacionDesde).startOf('day').toDate();
        }
        if (this.fechaMatriculacionHasta) {
            this.fechaMatriculacionHasta = moment(this.fechaMatriculacionHasta).endOf('day').toDate();
        }
        if (this.fechaVencimientoDesde) {
            this.fechaVencimientoDesde = moment(this.fechaVencimientoDesde).startOf('day').toDate();
        }
        if (this.fechaMatriculacionHasta) {
            this.fechaVencimientoHasta = moment(this.fechaVencimientoHasta).endOf('day').toDate();
        }
        this.lastRequest = this.profesionalService.getMatriculas(
            {
                vencidas: this.matriculasVencidas,
                bajaMatricula: this.matriculasBaja,
                especialidadCodigo: this.especialidad ? this.especialidad.codigo.sisa : null,
                profesionCodigo: this.profesion ? this.profesion.codigo : null,
                matriculasPorVencer: this.busquedaMatriculasProxAVencer,
                fechaDesde: this.busquedaMatriculasProxAVencer ? this.fechaVencimientoDesde : this.fechaMatriculacionDesde,
                fechaHasta: this.busquedaMatriculasProxAVencer ? this.fechaVencimientoHasta : this.fechaMatriculacionHasta,
                tipoMatricula: this.select.id,
                estado: this.estado.nombre,
                matriculacion: true,
                exportarPlanillaCalculo: exportarPlantilla,
                skip: this.skip,
                limit: limit
            })
            .subscribe(
                res => {
                    this.loader = false;
                    if (!exportarPlantilla) {
                        if (concatenar) {
                            if (res.length > 0) {
                                this.resultado = this.resultado.concat(res);
                            } else {
                                this.finScroll = true;
                                this.tengoDatos = false;
                            }
                        } else {
                            this.resultado = res;
                            this.tengoDatos = true;
                            this.finScroll = false;
                        }
                        this.profesionales = this.resultado;
                        this.profesionales$ = of(this.resultado);
                    } else {
                        let nombreArchivo = '';
                        if (this.select.id === 'posgrado') {
                            nombreArchivo = 'Reporte Matrículas de Posgrado';
                        } else {
                            nombreArchivo = 'Reporte Matrículas de Grado';
                        }
                        this.excelService.exportAsExcelFile(res, nombreArchivo);
                    }
                },
                () => {
                    this.loader = false;
                }
            );
    }

    isVencidaGrado(profesional) {
        return this.select?.nombre === 'Grado' && profesional.formacionGrado?.matriculado && profesional.formacionGrado?.papelesVerificados &&
            !profesional.formacionGrado?.renovacion && moment(profesional.ultimaMatricula?.fin).isBefore(moment().toDate());
    }

    isVencidaPosgrado(profesional) {
        return this.select?.nombre === 'Posgrado' && profesional.formacionPosgrado?.matriculado && profesional.formacionPosgrado?.tieneVencimiento
            && moment(profesional.ultimaMatricula?.fin).isBefore(moment().toDate());
    }

    isActivaGrado(profesional) {
        return profesional.formacionGrado?.matriculado && profesional.formacionGrado?.papelesVerificados &&
            !profesional.formacionGrado?.renovacion && moment(profesional.ultimaMatricula?.fin).isSameOrAfter(moment().toDate());
    }

    isActivaPosgrado(profesional) {
        return profesional.formacionPosgrado?.matriculado && moment(profesional.ultimaMatricula?.fin).isSameOrAfter(moment().toDate());
    }

    isBaja(profesional, tipo) {
        const esGrado = tipo === 'Grado';
        const esPosgrado = tipo === 'Posgrado';
        const formacion = esGrado ? profesional.formacionGrado : profesional.formacionPosgrado;

        if (this.selectSnapshot?.nombre !== tipo || !formacion) { // Usar selectSnapshot en lugar de select
            return false;
        }
        if (esGrado) {
            return (
                !formacion.matriculado &&
                !formacion.renovacion &&
                !formacion.papelesVerificados &&
                profesional.ultimaMatricula?.baja?.fecha
            );
        }
        if (esPosgrado) {
            return (
                !formacion.matriculado &&
                !formacion.papelesVerificados &&
                !formacion.revalida
            );
        }
        return false;
    }

    isVencida(profesional, tipo) {
        const esGrado = tipo === 'Grado';
        const esPosgrado = tipo === 'Posgrado';

        const formacion = esGrado ? profesional.formacionGrado : profesional.formacionPosgrado;

        if (this.selectSnapshot?.nombre !== tipo || !formacion) { // Usar selectSnapshot en lugar de select
            return false;
        }

        const fechaFin = profesional.ultimaMatricula?.fin;
        const vencida = fechaFin ? moment(fechaFin).isBefore(moment()) : false;

        if (esGrado) {
            return (
                formacion.matriculado &&
                formacion.papelesVerificados &&
                !formacion.renovacion &&
                vencida
            );
        }

        if (esPosgrado) {
            return (
                formacion.matriculado &&
                formacion.tieneVencimiento &&
                vencida
            );
        }

        return false;
    }

    isActiva(profesional, tipo) {
        const esGrado = tipo === 'Grado';
        const esPosgrado = tipo === 'Posgrado';

        const formacion = esGrado ? profesional.formacionGrado : profesional.formacionPosgrado;

        if (!formacion) {
            return false;
        }

        const fechaFin = profesional.ultimaMatricula?.fin;
        const activa = fechaFin ? moment(fechaFin).isSameOrAfter(moment()) : false;

        if (esGrado) {
            return (
                formacion.matriculado &&
                formacion.papelesVerificados &&
                !formacion.renovacion &&
                activa
            );
        }

        if (esPosgrado) {
            return (
                formacion.matriculado &&
                activa
            );
        }

        return false;
    }
}
