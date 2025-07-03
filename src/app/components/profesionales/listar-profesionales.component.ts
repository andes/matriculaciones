// General
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { Observable } from 'rxjs';
import { BusquedaProfesionalService } from './services/busqueda-profesional.service';
import { map, tap, take } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-listar-profesionales',
    templateUrl: 'listar-profesionales.html'
})

export class ListarProfesionalesComponent implements OnInit {
    public listado$: Observable<any[]>;
    private listadoActual: any[];
    public profesionalSeleccionado: IProfesional;
    public totalProfesionales = null;
    public nuevoProfesional = false;
    public totalProfesionalesRematriculados = null;
    public totalProfesionalesMatriculados = null;
    public filtroFechaRenovacion: any = {};
    public hoy = new Date();
    public confirmar = false;
    public verExportador = false;
    public expSisa = false;
    public editar = false;
    public movil = false;
    public seleccionado = false;
    public itemsDropdown: any = [];
    public exportSisa = {
        fechaDesde: '',
        fechaHasta: ''
    };
    public permisos: any = {};
    public filtrosRenovacion;
    public columns = [
        {
            key: 'profesional',
            label: 'Profesional',
        },
        {
            key: 'profesion',
            label: 'Profesión',
            opcional: true,
        },
        {
            key: 'estado',
            label: 'Posgrados/Estados',
            opcional: true,
        },
        { key: 'habilitado', label: '' },
        { key: 'acciones', label: '' }

    ];

    constructor(
        private profesionalService: ProfesionalService,
        private excelService: ExcelService,
        private router: Router,
        public auth: Auth,
        private busquedaProfesionalService: BusquedaProfesionalService,
        private breakpointObserver: BreakpointObserver
    ) { }

    ngOnInit() {
        this.listadoActual = [];
        this.profesionalService.getEstadisticas().subscribe((data) => {
            this.totalProfesionales = data.total;
            this.totalProfesionalesMatriculados = data.totalMatriculados;
            this.totalProfesionalesRematriculados = data.totalRematriculados;
        });
        // para que recuerde valor del filtro al volver a la pantalla de profesionales
        this.busquedaProfesionalService.filtroRenovacionActivo.subscribe(
            value => this.filtrosRenovacion = value
        );
        this.getListado();
        this.permisos.verProfesional = this.auth.check('matriculaciones:profesionales:getProfesional');
        this.permisos.supervisor = this.auth.check('matriculaciones:supervisor:?');
        this.permisos.crearProfesional = this.auth.check('matriculaciones:profesionales:postProfesional');
    }

    isMobile() {
        return this.breakpointObserver.isMatched('(max-width: 599px)');
    }

    changeFiltroRenovacionValue() {
        this.busquedaProfesionalService.filtroRenovacionActivo.next(this.filtrosRenovacion);
        this.getListado();
    }

    getListado() {
        const query = this.filtrosRenovacion ? this.busquedaProfesionalService.profesionalesRenovacionFiltrados$ : this.busquedaProfesionalService.profesionalesFiltrados$;
        this.listado$ = query.pipe(
            tap(data => this.listadoActual = data)
        );
    }

    setDropDown(profesional) {
        this.itemsDropdown = [];
        this.itemsDropdown[0] = { icon: 'turno-mas', label: 'DAR SOBRETURNO', handler: () => { this.sobreTurno(profesional); } };
        this.itemsDropdown[1] = { icon: 'pencil', label: 'EDITAR', handler: () => { this.editarProfesional(profesional); } };
    }

    showProfesional(profesional: any) {
        this.router.navigate(['/profesional', profesional.id]);
    }

    editarProfesional(profesional: any) {
        this.editar = true;
        this.profesionalSeleccionado = profesional;
        this.seleccionado = false;
    }

    seleccionar(profesional: any) {
        this.profesionalSeleccionado = profesional;
        this.verExportador = false;
        this.seleccionado = true;
    }

    cerrarResumenProfesional() {
        this.profesionalSeleccionado = null;
    }

    sobreTurno(profesional: any) {
        this.router.navigate(['/solicitarTurnoRenovacion', profesional.id]);
    }

    verNuevoProfesional(valor) {
        if (valor) {
            this.nuevoProfesional = true;
            this.confirmar = true;
        } else {
            this.nuevoProfesional = false;
        }
    }

    onScroll() {
        this.busquedaProfesionalService.lastResults.next(this.listadoActual);
    }

    exportarSisa() {
        this.expSisa = false;
        this.profesionalService.getProfesionalesSisa(this.exportSisa).subscribe((data) => {
            this.excelService.exportAsExcelFile(data, 'profesionales');
            this.expSisa = true;
        });
    }

    checkExpSisa() {
        if (this.exportSisa.fechaDesde && this.exportSisa.fechaHasta) {
            if (this.exportSisa.fechaDesde <= this.exportSisa.fechaHasta) {
                this.expSisa = true;
            } else {
                this.expSisa = false;
            }
        } else {
            this.expSisa = false;
        }
    }

    crearNuevoProfesional() {
        this.cerrarResumenProfesional();
        this.nuevoProfesional = true;
        this.confirmar = true;
        this.seleccionado = false;
    }

    exportarSISA() {
        this.verExportador = true;
        this.seleccionado = false;
    }

    cancelarDetalle(evento) {
        this.seleccionado = evento;
    }

    verificarEstadoGrado(iProfesional, iGrado) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesionalGrado = this.listadoActual[iProfesional]?.formacionGrado[iGrado];
        if (profesionalGrado) {
            if (!profesionalGrado.matriculado) {
                return 'suspendida';
            } else {
                const matriculacionGrado = profesionalGrado.matriculacion;
                if (matriculacionGrado?.length && this.hoy > matriculacionGrado[matriculacionGrado.length - 1].fin) {
                    return 'vencida';
                } else {
                    return 'vigente';
                }
            }
        }
    }

    obtenerMatriculaGrado(iProfesional, iGrado) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesional = this.listadoActual[iProfesional].formacionGrado[iGrado];
        if (profesional.matriculacion) {
            if (profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero) {
                return profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero;
            }
        }
        return '';
    }

    verificarEstadoPosgrado(iProfesional, iGrado) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado[iGrado];
        if (profesionalPosgrado) {
            if (!profesionalPosgrado.matriculado) {
                return 'suspendida';
            } else {
                if (!profesionalPosgrado.tieneVencimiento) {
                    return 'sinVencimiento';
                } else {
                    if (this.hoy > profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].fin) {
                        return 'vencida';
                    } else {
                        return 'vigente';
                    }
                }
            }
        }
    }

    obtenerMatriculaPosgrado(iProfesional, iGrado) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado[iGrado];
        if (profesionalPosgrado.matriculacion !== null) {
            if (profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1]?.matriculaNumero !== undefined) {
                return profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].matriculaNumero;
            } else {
                return '';
            }
        }
    }
    verificarFechaPosgrado(iProfesional, iGrado) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado[iGrado];
        return ((this.hoy.getTime() - profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }

    contarTiposDePosgrados(iProfesional, tipo) {
        if (!this.listadoActual?.length) {
            return;
        }
        const profesionalPosgrado = this.listadoActual[iProfesional]?.formacionPosgrado;
        let anioGracia = 0, suspendidas = 0, vencidas = 0;
        profesionalPosgrado?.forEach(element => {
            if (tipo === 'anioDeGracia' && element.tieneVencimiento &&
                element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 0 &&
                    element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) < 365))) {
                anioGracia++;
            } else {
                if (tipo === 'vencida' && element.tieneVencimiento &&
                    element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365) &&
                    element.matriculado && ((this.hoy.getTime() - element.matriculacion[0].fin.getTime()) / (1000 * 3600 * 24) > 365)) {
                    vencidas++;
                } else {
                    if (tipo === 'suspendida' && !element.matriculado) {
                        suspendidas++;
                    }
                }
            }
        });
        if (tipo === 'anioDeGracia') {
            return anioGracia;
        } else {
            if (tipo === 'suspendida') {
                return suspendidas;
            } else {
                return vencidas;
            }
        }
    }
}
