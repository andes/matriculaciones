import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { SIISAService } from '../../services/siisa.service';
import { ISiisa } from '../../interfaces/ISiisa';
import { ProfesionalService } from '../../services/profesional.service';
import { IProfesional } from '../../interfaces/IProfesional';
import { ExcelService } from '../../services/excel.service';

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
    public profesion: ISiisa;
    public especialidad: ISiisa;
    public matriculasBaja = false;
    public matriculasVencidas = false;
    public loader = false;
    public profesionales: IProfesional[];

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
        this.profesionalService.getProfesional(
            {
                estado: this.matriculasVencidas ? 'Suspendidas' : '',
                estadoE: this.matriculasVencidas ? 'Suspendidas' : '',
                bajaMatricula: this.matriculasBaja,
                bajaMatriculaE: this.matriculasBaja,
                especialidadCodigo: this.especialidad ? this.especialidad.codigoSISA : '',
                profesionCodigo: this.profesion ? this.profesion.codigoSISA : '',
                profesionCodigoE: this.profesion ? this.profesion.codigoSISA : '',
                matriculasPorVencer: this.busquedaMatriculasProxAVencer,
                fechaDesde: this.fechaMatriculacionDesde,
                fechaHasta: this.fechaMatriculacionHasta,
                // rematriculado: this.estaRematriculado ? this.estaRematriculado : 0,
                // matriculado: this.estaMatriculado ? this.estaMatriculado : 0,
                matriculacion: true,
                exportarPlanillaCalculo: exportarPlantilla
            }).subscribe(res => {
                this.loader = false;
                if (!exportarPlantilla) {
                    this.profesionales = res;
                } else {
                    this.excelService.exportAsExcelFile(res, 'Reporte profesionales');
                }
            });
    }

}
