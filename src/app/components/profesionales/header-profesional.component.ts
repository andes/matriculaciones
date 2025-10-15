import { Component, Input, Output, OnInit, EventEmitter, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../interfaces/IProfesional';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header-profesional',
    templateUrl: 'header-profesional.html',
    styles: ['.img-circle {  border-radius: 50%;  width: 128px !important;height: 128px !important;}']
})

export class HeaderProfesionalComponent implements OnInit, OnChanges {
    public foto = null;
    public agenteMatriculador = null;
    public habilitado: any;
    public estaHabilitado: any;
    public tieneFoto = false;
    public codigoProfesional = null;
    @Input() profesional: IProfesional;
    @Input() img64 = null;
    @Input() idProfesional;
    @Output() salida = new EventEmitter();
    constructor(
        private _profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
        public auth: Auth,
        private plex: Plex,
    ) { }

    ngOnInit() {
        this.habilitado = this.profesional.habilitado;
        this.agenteMatriculador = this.auth.usuario.nombreCompleto;

        this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).pipe(catchError(() => of(null))).subscribe(resp => {
            if (resp) {
                this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                this.tieneFoto = true;
            }
        });
        if (this.profesional.habilitado) {
            this.estaHabilitado = true;
        } else {
            this.estaHabilitado = false;
        }
        for (const formacionGrado of this.profesional.formacionGrado) {
            if (formacionGrado.configuracionSisa?.codigoProfesional) {
                this.codigoProfesional = formacionGrado.configuracionSisa.codigoProfesional;
            }
        }
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

    habilitar() {
        let mensaje;
        if (this.profesional.habilitado) {
            mensaje = '¿Desea deshabilitar este profesional?';
        } else {
            mensaje = '¿Desea habilitar este profesional?';
        }
        this.plex.confirm(mensaje).then((resultado) => {
            if (resultado) {
                this.estaHabilitado = !this.estaHabilitado;
                this.profesional.habilitado = !this.profesional.habilitado;
                this.habilitado = !this.habilitado;
                const cambio = {
                    'op': 'updateHabilitado',
                    'data': this.habilitado,
                    'agente': this.auth.usuario.nombreCompleto
                };

                this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });

            } else {
                this.habilitado = this.profesional.habilitado;
            }
        });

    }

    editar() {
        this.salida.emit();
    }

    verificarSISA() {
        const cambio = {
            'op': 'updateEstadoGrado',
            'data': this.profesional.formacionGrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe();
    }
}
