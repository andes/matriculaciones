import { Component, OnInit, OnChanges, EventEmitter, HostBinding, Output } from '@angular/core';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import 'rxjs/add/operator/switchMap';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    public pos;
    public profesional;
    public hoy;
    public editar = false;
    public editable = false;
    public img64 = null;
    public foto: any;
    public tieneFoto = false;
    value;
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

    constructor(
        private _profesionalService: ProfesionalService,
        private router: Router,
        public sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.hoy = new Date();

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

    cargarProfesionales() {
        this._profesionalService.getProfesional({
        }).subscribe((data) => {
            this.profesionales = data;
        });
    }

    showProfesional(profesional: any) {
        this.router.navigate(['/profesional', profesional.id]);
    }
}
