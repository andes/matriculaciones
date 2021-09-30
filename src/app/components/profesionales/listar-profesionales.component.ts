import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { Observable } from 'rxjs';
import { BusquedaProfesionalService } from './services/busqueda-profesional.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-listar-profesionales',
    templateUrl: 'listar-profesionales.html'
})

export class ListarProfesionalesComponent implements OnInit {
    public listado$: Observable<any[]>;
    private listadoActual: any[];
    public profesionalElegido: IProfesional;
    public tienePermisos;
    public totalProfesionales = null;
    public nuevoProfesional = false;
    public totalProfesionalesRematriculados = null;
    public totalProfesionalesMatriculados = null;
    public hoy = null;
    public confirmar = false;
    public verExportador = false;
    public expSisa = false;
    public editar = false;
    public seleccionado = false;
    public profesionalSeleccionado;
    itemsDropdown: any = [];
    public exportSisa = {
        fechaDesde: '',
        fechaHasta: ''
    };
    value;
    public columns = [
        {
            key: 'profesional',
            label: 'Profesional',
        },
        {
            key: 'documento',
            label: 'Documento',
            opcional: true,
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
        {
            key: ''
        }
    ];
    constructor(
        private _profesionalService: ProfesionalService,
        private excelService: ExcelService,
        private router: Router,
        public auth: Auth,
        private busquedaProfesionalService: BusquedaProfesionalService
    ) { }

    ngOnInit() {
        this.hoy = new Date();
        this._profesionalService.getEstadisticas().subscribe((data) => {
            this.totalProfesionales = data.total;
            this.totalProfesionalesMatriculados = data.totalMatriculados;
            this.totalProfesionalesRematriculados = data.totalRematriculados;
        });
        this.listado$ = this.busquedaProfesionalService.profesionalesFiltrados$.pipe(
            map(resp => this.listadoActual = resp)
        );
        this.tienePermisos = this.auth.check('matriculaciones:profesionales:getProfesional');
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
        this.profesionalElegido = null;
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

    verBajas() {
        return this.busquedaProfesionalService.verBajas.getValue();
    }

    exportarSisa() {
        this.expSisa = false;
        this._profesionalService.getProfesionalesSisa(this.exportSisa).subscribe((data) => {
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

    getFechaUltimoTramite(profesional: IProfesional) {
        const fechasEgreso = profesional.formacionGrado.map(grado => grado.fechaEgreso);
        return Math.max.apply(null, fechasEgreso);
    }

    crearMuevoProfesional() {
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
        const profesionalGrado = this.listadoActual[iProfesional].formacionGrado[iGrado];
        if (profesionalGrado) {
            if (!profesionalGrado.matriculado) {
                return 'suspendida';
            } else {
                if (this.hoy > profesionalGrado.matriculacion[profesionalGrado.matriculacion.length - 1].fin) {
                    return 'vencida';
                } else {
                    return 'vigente';
                }
            }
        }
    }

    obtenerMatriculaGrado(iProfesional, iGrado) {
        const profesional = this.listadoActual[iProfesional].formacionGrado[iGrado];
        if (profesional.matriculacion) {
            if (profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero) {
                return profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero;
            }
        }
        return '';
    }

    verificarFechaGrado(iProfesional, iGrado) {
        const profesional = this.listadoActual[iProfesional].formacionGrado[iGrado];
        return ((this.hoy.getTime() - profesional.matriculacion[profesional.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }


    verificarEstadoPosgrado(iProfesional, iGrado) {
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
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado[iGrado];
        if (profesionalPosgrado.matriculacion !== null) {
            if (profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1] ?.matriculaNumero !== undefined) {
                return profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].matriculaNumero;
            } else {
                return '';
            }
        }
    }
    verificarFechaPosgrado(iProfesional, iGrado) {
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado[iGrado];
        return ((this.hoy.getTime() - profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }

    contarTiposDePosgrados(iProfesional, tipo) {
        const profesionalPosgrado = this.listadoActual[iProfesional].formacionPosgrado;
        let anioGracia = 0, suspendidas = 0, vencidas = 0;
        profesionalPosgrado.forEach(element => {
            if (tipo === 'anioDeGracia' && element.tieneVencimiento &&
        element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 0 &&
          element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) < 365))) {
                anioGracia++;
            } else {
                if (tipo === 'vencida' && element.tieneVencimiento &&
          element.matriculado && ((this.hoy.getTime() - element.matriculacion[element.matriculacion?.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365)) {
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
