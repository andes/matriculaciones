import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IProfesional } from './../../../interfaces/IProfesional';
import { SIISAService } from './../../../services/siisa.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';


@Component({
    selector: 'app-formacion-posgrado-agregar',
    templateUrl: 'formacion-posgrado-agregar.html',
})

export class FormacionPosgradoAgregarComponent implements OnInit {
    @Output() cancelarPosgradoAdd = new EventEmitter();
    @Output() agregarPosgrado = new EventEmitter();
    @Input() profesional: IProfesional;

    public cancel = false;
    profesiones: any[] = [];
    vencimientoAnio = (new Date()).getUTCFullYear() + 5;
    profesionalP: any = {
        exportadoSisa: false,
        profesion: null,
        institucionFormadora: {
            nombre: null,
            codigo: null,
        },
        especialidad: null,
        observacion: null,
        certificacion: {
            fecha: null,
            modalidad: null,
            establecimiento: {
                nombre: null,
                codigo: null,
            },
        },
        papelesVerificados: true,
        matriculado: true,
        revalida: false,
        matriculacion: [{
            matriculaNumero: null,
            libro: '',
            folio: '',
            inicio: new Date(),
            notificacionVencimiento: false,
            fin: new Date(new Date().setFullYear(this.vencimientoAnio)),
            revalidacionNumero: 1,
        }],
        tieneVencimiento: true,
        fechasDeAltas: [{ fecha: new Date() }]
    };

    constructor(
        private _siisaSrv: SIISAService,
        private _modalidadesCertificacionService: ModalidadesCertificacionService,
    ) { }

    ngOnInit() {
        if (this.profesional) {
            this.profesional.formacionGrado.forEach(element => {
                if (element.profesion.codigo === 1 || element.profesion.codigo === 2) {
                    this.profesiones.push(element.profesion);
                }
            });

        }
    }

    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades('').subscribe(event.callback);
    }

    loadModalidadesCertificacion(event) {
        this._modalidadesCertificacionService.getModalidadesCertificacion().subscribe(event.callback);
    }

    onSubmit(formulario) {
        if (formulario.form.valid) {
            this.profesionalP.matriculacion.revalidacionNumero++;
            this.agregarPosgrado.emit(this.profesionalP);
            this.volver();
        }
    }

    volver() {
        this.cancelarPosgradoAdd.emit(this.cancel);
    }
}
