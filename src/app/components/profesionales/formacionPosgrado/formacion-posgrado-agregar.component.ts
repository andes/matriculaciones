import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IProfesional, IformacionPosgrado } from './../../../interfaces/IProfesional';
import { SIISAService } from './../../../services/siisa.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';
import * as moment from 'moment';

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
    fechaAlta = moment().toDate();
    profesion;
    especialidad;
    matriculaNumero;
    modalidad;
    nota;
    formacionPosgrado: IformacionPosgrado = {
        exportadoSisa: false,
        profesion: null,
        institucionFormadora: {
            nombre: null,
            codigo: null,
        },
        especialidad: null,
        fechaIngreso: null,
        fechaEgreso: null,
        tituloFileId: null,
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
        fechaDeVencimiento: null,
        matriculado: true,
        revalida: false,
        matriculacion: [{
            matriculaNumero: null,
            fechaAlta: null,
            baja: { motivo: null, fecha: null },
            periodos: [{
                inicio: null,
                fin: null,
                revalidacionNumero: 0,
                notificacionVencimiento: false,
                revalida: false
            }]
        }],
        tieneVencimiento: true,
        notas: [null]
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
            const fechaFin = moment(this.fechaAlta).startOf('year').add(5, 'years');
            this.formacionPosgrado.profesion = {
                codigo: this.profesion.codigo,
                nombre: this.profesion.nombre
            };
            this.formacionPosgrado.especialidad = this.especialidad;
            this.formacionPosgrado.certificacion = {
                fecha: this.fechaAlta,
                modalidad: this.modalidad,
                establecimiento: { nombre: null, codigo: null },
            };
            this.formacionPosgrado.matriculacion = [{
                matriculaNumero: this.matriculaNumero,
                fechaAlta: this.fechaAlta,
                baja: { motivo: null, fecha: null },
                periodos: [{
                    inicio: this.fechaAlta,
                    fin: fechaFin.toDate(),
                    revalidacionNumero: 0,
                    notificacionVencimiento: false,
                    revalida: false
                }]
            }];
            this.formacionPosgrado.tieneVencimiento = true;
            this.formacionPosgrado.notas = [this.nota];
            this.agregarPosgrado.emit(this.formacionPosgrado);
            this.volver();
        }
    }

    volver() {
        this.cancelarPosgradoAdd.emit(this.cancel);
    }
}
