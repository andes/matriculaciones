import { Component, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-listar-profesionales-detalle',
    templateUrl: 'listar-profesionales-detalle.html',
    styles: ['.img-circle {  border-radius: 50%;  width: 128px !important;height: 128px !important;}']
})

export class ListarProfesionalesDetalleComponent implements OnInit, OnChanges {
    public profesionales: IProfesional[];
    @Output() cancelar = new EventEmitter();
    @Output() editarSidebar = new EventEmitter();
    @Input() idProfesional: IProfesional;
    @Input('profesionalSeleccionado')
    set _profesionalSeleccionado(value) {
        this.profesionalObtenido = value;
        this.actualizarIndice();
    }
    public cancel = false;
    public profesionalObtenido;
    public profesional;
    public hoy;
    public img64 = null;
    public foto: any;
    public tieneFoto = false;
    public columns = [
        {
            key: 'nombre',
            label: 'ESPECIALIDAD',
        },
        {
            key: 'matriculaNumero',
            label: 'MATRÍCULA NRO.',
        },
        {
            label: 'ESTADO',
        },
    ];

    public columnsNotas = [
        {
            key: 'fecha',
            label: 'FECHA',
        },
        {
            key: 'usuario',
            label: 'USUARIO',
        },
        {
            key: 'desccripcion',
            label: 'DESCRIPCIÓN',
        }
    ];

    constructor(
        private _profesionalService: ProfesionalService,
        private router: Router,
        public sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.hoy = moment().toDate();
        this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).pipe(catchError(() => of(null))).subscribe(resp => {
            if (resp) {
                this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                this.tieneFoto = true;
            }
        });
    }

    ngOnChanges() {
        if (this.img64) {
            this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.img64);
        } else if (this.idProfesional) {
            this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).pipe(catchError(() => of(null))).subscribe(resp => {
                if (resp) {
                    this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + resp);
                }
            });
        }
    }

    volver() {
        this.cancelar.emit(this.cancel);
    }

    editarProfesional() {
        this.editarSidebar.emit(this.profesional);
    }

    actualizarIndice() {
        this.profesional = this.profesionalObtenido;
    }

    showProfesional(profesional: any) {
        this.router.navigate(['/profesional', profesional.id]);
    }

    verificarEstado(i) {
        const profesionalPosgrado = this.profesional.formacionPosgrado[i];
        if (profesionalPosgrado.matriculacion?.length) {
            if (!profesionalPosgrado.matriculado) {
                return 'suspendida';
            } else {
                if (!profesionalPosgrado.tieneVencimiento) {
                    return 'sinVencimiento';
                } else {
                    if (profesionalPosgrado.revalida) {
                        return 'verificarPapeles';
                    } else {
                        if (this.hoy > profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].fin &&
                            this.hoy > profesionalPosgrado.matriculacion[0].fin) {
                            return 'vencida';
                        } else {
                            return 'vigente';
                        }
                    }
                }
            }
        }
    }

    verificarFecha(i) {
        const profesionalPosgrado = this.profesional.formacionPosgrado[i];
        return ((this.hoy.getTime() - profesionalPosgrado.matriculacion[profesionalPosgrado.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }
}
