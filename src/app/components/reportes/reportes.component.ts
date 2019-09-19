import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { SIISAService } from '../../services/siisa.service';
import { ISiisa } from '../../interfaces/ISiisa';
import { ProfesionalService } from '../../services/profesional.service';
import { IProfesional } from '../../interfaces/IProfesional';
import { ExcelService } from '../../services/excel.service';
import * as enumerados from '../../utils/enumerados';
import { ISubscription } from 'rxjs/Subscription';

const limit = 20;
@Component({
    selector: 'app-reportes',
    templateUrl: 'reportes.html'
})

export class ReportesComponent implements OnInit {
    public busquedaMatriculasProxAVencer = false;
    public fechaMatriculacionDesde: Date;
    public fechaMatriculacionHasta: Date;
    public fechaVencimientoDesde: Date;
    public fechaVencimientoHasta: Date;
    public mostrarMasOpciones = false;
    public profesiones: ISiisa[];
    public especialidades: ISiisa[];
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

    constructor(private auth: Auth, private router: Router, private siisaService: SIISAService,
        private profesionalService: ProfesionalService, private excelService: ExcelService) { }

    ngOnInit() {
        if (!this.auth.check('matriculaciones:reportes')) {
            this.router.navigate(['inicio']);
        }
        this.siisaService.getProfesiones().subscribe(res => {
            this.profesiones = res;

        })

        this.siisaService.getEspecialidades(null).subscribe(res => {
            this.especialidades = res;

        })
    }

    public onChange(event) {
        if (event.value) {
            this.fechaMatriculacionDesde = null;
            this.fechaMatriculacionHasta = null;
        } else {
            this.fechaVencimientoDesde = null;
            this.fechaVencimientoHasta = null;
        }
        this.matriculasVencidas = false;
    }
    public onChangeVencidas(event) {
        this.fechaVencimientoDesde = null;
        this.fechaVencimientoHasta = null;
        this.busquedaMatriculasProxAVencer = false;
    }
    public onChangeBaja(event) {
        this.fechaVencimientoDesde = null;
        this.fechaVencimientoHasta = null;
    }

    public generarReporte(exportarPlantilla: boolean) {
        this.loader = true;
        this.deshabilitarExportar = exportarPlantilla;
        this.loadDatos(exportarPlantilla, false);
    }

    public nextPage() {
        if (this.tengoDatos && !this.loader) {
            this.loader = true;
            this.skip += limit;
            this.loadDatos(false, true);
        }
    }

    private loadDatos(exportarPlantilla: boolean, concatenar = false) {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
        if (!concatenar) {
            this.profesionales = [];
            this.skip = 0;
        }
        this.lastRequest = this.profesionalService.getMatriculas(
            {
                vencidas: this.matriculasVencidas,
                bajaMatricula: this.matriculasBaja,
                especialidadCodigo: this.especialidad ? this.especialidad.codigo.sisa : null,
                profesionCodigo: this.profesion ? this.profesion.codigo : null,
                matriculasPorVencer: this.busquedaMatriculasProxAVencer,
                fechaDesde: (!this.busquedaMatriculasProxAVencer && !this.matriculasBaja) ?
                    (this.busquedaMatriculasProxAVencer ? this.fechaVencimientoDesde : this.fechaMatriculacionDesde) : null,
                fechaHasta: (!this.busquedaMatriculasProxAVencer && !this.matriculasBaja) ?
                    (this.busquedaMatriculasProxAVencer ? this.fechaVencimientoHasta : this.fechaMatriculacionHasta) : null,
                tipoMatricula: this.select.id,
                matriculacion: true,
                exportarPlanillaCalculo: exportarPlantilla,
                skip: this.skip,
                limit: limit
            }).subscribe(res => {
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
                } else {
                    let nombreArchivo = '';
                    if (this.select.id === 'posgrado') {
                        nombreArchivo = 'Reporte Matrículas de Posgrado'
                    } else {
                        nombreArchivo = 'Reporte Matrículas de Grado'
                    }
                    this.excelService.exportAsExcelFile(res, nombreArchivo);
                }
            },
                err => {
                    this.loader = false;
                });
    }

    isVencida(fecha) {
        let fechaVencimiento = new Date(fecha);
        return (new Date() > fechaVencimiento)
    }
}
