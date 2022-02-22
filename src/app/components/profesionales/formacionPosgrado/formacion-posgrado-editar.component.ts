import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from '../../../interfaces/IProfesional';
import * as moment from 'moment';
import { ProfesionalService } from '../../../services/profesional.service';
import { SIISAService } from '../../../services/siisa.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';

@Component({
    selector: 'app-formacion-posgrado-editar',
    templateUrl: 'formacion-posgrado-editar.html',
})

export class FormacionPosgradoEditarComponent implements OnInit {
    @Input() profesional: IProfesional;
    @Output() cancelarPosgradoEdit = new EventEmitter();

    @Input('indice')
    set _indice(value) {
        this.indice = value;
        this.actualizarIndice();
    }
    public indice;
    public cancel = false;
    profesiones: any[] = [];
    public pos;
    public existeNota = false;
    public fechaAgregada = false;
    public fechaEditada = false;
    public editarOagregar = false;
    public profesion;
    public especialidad;
    public matriculaNumero;
    public libro;
    public folio;
    public nota;
    public modalidad;
    public proximaFechaDeAlta;

    constructor(
        private _profesionalService: ProfesionalService,
        private _modalidadesCertificacionService: ModalidadesCertificacionService,
        private _siisaSrv: SIISAService,
        private plex: Plex,
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

    dropitems = [
        {
            label: 'DAR DE BAJA',
            icon: 'cesto',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.darDeBaja();
            }
        },
    ];

    actualizarIndice() {
        this.pos = this.profesional.formacionPosgrado[this.indice].matriculacion.length - 1;
        this.profesion = this.profesional.formacionPosgrado[this.indice].profesion;
        this.especialidad = this.profesional.formacionPosgrado[this.indice].especialidad;
        this.matriculaNumero = this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].matriculaNumero;
        this.libro = this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].libro;
        this.folio = this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].folio;
        this.modalidad = this.profesional.formacionPosgrado[this.indice].certificacion?.modalidad;
        this.nota = this.profesional.formacionPosgrado[this.indice].notas;
    }

    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(event.callback);
    }

    loadModalidadesCertificacion(event) {
        this._modalidadesCertificacionService.getModalidadesCertificacion().subscribe(event.callback);
    }

    guardar(event) {
        if (event.form.valid) {
            const cambio = {
                'op': 'updateEstadoPosGrado',
                'data': this.profesional.formacionPosgrado
            };
            this.profesional.formacionPosgrado[this.indice].profesion = this.profesion;
            this.profesional.formacionPosgrado[this.indice].especialidad = this.especialidad;
            this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].matriculaNumero = this.matriculaNumero;
            this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].libro = this.libro;
            this.profesional.formacionPosgrado[this.indice].matriculacion[this.pos].folio = this.folio;
            if (this.profesional.formacionPosgrado[this.indice].certificacion) {
                this.profesional.formacionPosgrado[this.indice].certificacion.modalidad = this.modalidad;
            } else {
                this.profesional.formacionPosgrado[this.indice].certificacion = { fecha: new Date, modalidad: this.modalidad, establecimiento: null };
            }
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
                this.plex.toast('success', 'Los datos han sido editados con éxito!', 'informacion', 1000);
            });
            this.volver();
        }
    }

    pushFechasAlta() {
        this.profesional.formacionPosgrado[this.indice].fechasDeAltas.push({ fecha: this.proximaFechaDeAlta });
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.plex.toast('success', 'La nueva fecha de alta ha sido cargada con éxito', 'informacion', 1000);
        });

        this.cerrarFechaAlta();
    }

    editarUltimaFechaAlta(event) {
        if (event.form.valid) {
            const cambio = {
                'op': 'updateEstadoPosGrado',
                'data': this.profesional.formacionPosgrado
            };
            this.profesional.formacionPosgrado[this.indice].fechasDeAltas[this.profesional.formacionPosgrado[this.indice].fechasDeAltas.length - 1].fecha = this.proximaFechaDeAlta;
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
                this.plex.toast('success', 'La fecha se ha modificado con exito!', 'informacion', 1000);
            });
            this.cerrarFechaAlta();
        }
    }

    borrarFechaAlta(fechas, i) {
        this.plex.confirm('¿Desea eliminar la siguiente fecha de alta : <strong>' + moment(fechas[i].fecha).format('DD MMMM YYYY') + '</strong>').then((resultado) => {
            if (resultado) {
                fechas.splice(i, 1);
                this.actualizar();
            }
        });
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.profesional.formacionPosgrado[this.indice].matriculado = false;
                this.profesional.formacionPosgrado[this.indice].papelesVerificados = false;
                this.actualizar();
                this.volver();
            }
        });

    }

    actualizar() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.plex.toast('success', 'Se ha eliminado con éxito!', 'informacion', 1000);
        });
    }

    agregarFechaDeAlta() {
        this.fechaAgregada = true;
    }
    cerrarFechaAlta() {
        this.fechaAgregada = false;
        this.fechaEditada = false;
    }
    agregarFechaEditada() {
        this.fechaEditada = true;
    }
    cerrarFechaEditada() {
        this.fechaEditada = false;
    }
    cerrarNota() {
        this.editarOagregar = false;
        this.existeNota = false;
    }

    condicionNota() {
        this.existeNota = true;
        this.editarOagregar = true;
        if (this.profesional.formacionPosgrado[this.indice].notas !== null) {
            this.nota = this.profesional.formacionPosgrado[this.indice].notas;
        } else {
            this.nota = '';
        }
    }

    guardarNota() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this.profesional.formacionPosgrado[this.indice].notas = this.nota;
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.plex.toast('success', 'La nota se modifico con exito!', 'informacion', 1000);
        });
        this.cerrarNota();
    }

    volver() {
        this.cancelarPosgradoEdit.emit(this.cancel);
    }
}
