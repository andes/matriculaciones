import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { SIISAService } from '../../services/siisa.service';
import { ISiisa } from '../../interfaces/ISiisa';
import { ProfesionalService } from '../../services/profesional.service';
import { IProfesional } from '../../interfaces/IProfesional';
import { ExcelService } from '../../services/excel.service';

const limit = 50;
@Component({
    selector: 'app-reportes',
    templateUrl: 'reportes.html'
})

export class ReportesComponent implements OnInit {
    public busquedaMatriculasProxAVencer = false;
    public fechaMatriculacionDesde: Date;
    public fechaMatriculacionHasta: Date;
    public mostrarMasOpciones = false;
    public profesiones: ISiisa[];
    public profesion: any;
    public especialidad: any;
    public matriculasBaja = false;
    public matriculasVencidas = false;
    public loader = false;
    public profesionales: IProfesional[];
    public deshabilitarExportar = false;

    private skip = 0;
    private tengoDatos = true;
    public finScroll = false;
    public resultado = [];

    constructor(private auth: Auth, private router: Router, private siisaService: SIISAService,
        private profesionalService: ProfesionalService, private excelService: ExcelService) { }

    ngOnInit() {
        if (!this.auth.check('matriculaciones:reportes')) {
            this.router.navigate(['inicio']);
        }
        this.siisaService.getProfesiones().subscribe(res => {
            this.profesiones = res;
        })
    }

    public generarReporte(exportarPlantilla: boolean) {
        this.loader = true;
        this.deshabilitarExportar = exportarPlantilla;
        this.loadDatos(exportarPlantilla);
    }

    public nextPage() {
        if (this.tengoDatos) {
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
    }

    private loadDatos(exportarPlantilla: boolean, concatenar = false) {
        this.profesionalService.getProfesional(
            {
                estado: this.matriculasVencidas ? 'Suspendidas' : '',
                estadoE: this.matriculasVencidas ? 'Suspendidas' : '',
                bajaMatricula: this.matriculasBaja,
                especialidadCodigo: this.especialidad ? this.especialidad.codigo : '',
                profesionCodigo: this.profesion ? this.profesion.codigo : '',
                matriculasPorVencer: this.busquedaMatriculasProxAVencer,
                fechaDesde: this.fechaMatriculacionDesde,
                fechaHasta: this.fechaMatriculacionHasta,
                // rematriculado: this.estaRematriculado ? this.estaRematriculado : 0,
                // matriculado: this.estaMatriculado ? this.estaMatriculado : 0,
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
                        this.finScroll = false;
                    }
                    this.profesionales = res;
                } else {
                    this.excelService.exportAsExcelFile(res, 'Reporte profesionales');
                }
            });
    }

}
