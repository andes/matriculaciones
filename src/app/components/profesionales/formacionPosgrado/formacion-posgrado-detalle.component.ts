
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../../interfaces/IProfesional';
import * as moment from 'moment';
import { ProfesionalService } from './../../../services/profesional.service';
import { Auth } from '@andes/auth';
@Component({
    selector: 'app-formacion-posgrado-detalle',
    templateUrl: 'formacion-posgrado-detalle.html',
    styleUrls: ['posGrado.scss']
})
export class FormacionPosgradoDetalleComponent implements OnInit {

    @Input() formacion: any;
    @Input() index: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();
    @Output() cerrarDetalle = new EventEmitter();
    @Output() anioDeGraciaOutPut = new EventEmitter();
    @Output() editarEspecialidad = new EventEmitter();
    @Output() indice = new EventEmitter();
    public esSupervisor;
    public edit = true;
    hoy = new Date();
    public showBtnSinVencimiento = false;
    public columnasFechas = [];
    public matricula = [
        {
            key: 'matriculaNumero',
            label: 'MATRÍCULA NRO.'
        },
        {
            key: 'inicio',
            label: 'INICIO'
        },
        {
            key: 'fin',
            label: 'FIN'
        },
    ];
    public revalida = [
        {
            key: 'revalidacionNumero',
            label: 'NRO.'
        },
        {
            key: 'matriculaNumero',
            label: 'MATRÍCULA NRO.'
        },
        {
            key: 'inicio',
            label: 'INICIO'
        },
        {
            key: 'fin',
            label: 'FIN'
        },
        {
            key: 'estado',
            label: 'ESTADO'
        },
    ];
    constructor(private _profesionalService: ProfesionalService,
                private plex: Plex, public auth: Auth) {
    }

    ngOnInit() {
        this.hoy = new Date();
        this.esSupervisor = this.auth.getPermissions('matriculaciones:supervisor:?').length > 0;
        if (moment().diff(moment(this.profesional.fechaNacimiento, 'DD-MM-YYYY'), 'years') >= 65) {
            this.showBtnSinVencimiento = true;
        }
    }

    renovarProfesional(formacion: any) {
        let texto;
        if (this.estaVencida(this.index) || !formacion.tieneVencimiento) {
            texto = '¿Desea agregar una nueva reválida?';
        } else {
            texto = '¿Desea revalidar antes de la fecha de vencimiento?';
        }

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                let revNumero = null;
                if (formacion.matriculacion === null) {
                    revNumero = 0;
                } else {
                    if (formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero) {
                        revNumero = formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero;
                    } else {
                        revNumero = formacion.matriculacion.length;
                    }
                }

                const matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                const oMatriculacion = {
                    matriculaNumero: matriculaNumero,
                    libro: this.formacion.matriculacion[formacion.matriculacion.length - 1].libro,
                    folio: this.formacion.matriculacion[formacion.matriculacion.length - 1].folio,
                    inicio: new Date(),
                    notificacionVencimiento: false,
                    fin: new Date(new Date().setFullYear(vencimientoAnio)),
                    revalidacionNumero: revNumero + 1
                };

                this.formacion.revalida = false;
                this.formacion.matriculado = true;
                if (this.profesional.formacionPosgrado[this.index].matriculacion === null) {
                    this.profesional.formacionPosgrado[this.index].matriculacion = [oMatriculacion];
                } else {
                    this.profesional.formacionPosgrado[this.index].matriculacion.push(oMatriculacion);
                }
                this.actualizar();
            }
        });
    }

    borrarFechaAlta(fechas, i) {
        this.plex.confirm('¿Desea eliminar la siguiente fecha de alta : <strong>' + moment(fechas[i].fecha).format('DD MMMM YYYY') + '</strong>').then((resultado) => {
            if (resultado) {
                fechas.splice(i, 1);
                this.actualizar();
            }
        });
    }

    papelesVerificados() {
        this.profesional.supervisor = {
            id: this.auth.usuario.id,
            nombreCompleto: this.auth.usuario.nombreCompleto
        };
        this.formacion.papelesVerificados = true;
        this.formacion.matri = true;
        this.profesional.formacionPosgrado[this.index] = this.formacion;
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.profesional.formacionPosgrado[this.index].matriculado = false;
                this.profesional.formacionPosgrado[this.index].papelesVerificados = false;
                this.actualizar();
            }
        });
    }

    anioDeGracia() {
        this.plex.confirm('¿Desea otorgarle un año de gracia a este profesional?').then((resultado) => {
            if (resultado) {
                this.formacion.matriculacion[this.formacion.matriculacion.length - 1].fin.setFullYear(this.formacion.matriculacion[this.formacion.matriculacion.length - 1].fin.getFullYear() + 1);
                this.formacion.papelesVerificados = true;
                this.formacion.revalida = false;
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index] = this.formacion;
                this.actualizar();
                this.anioDeGraciaOutPut.emit(this.formacion.matriculacion);
            }
        });
    }

    cerrar() {
        this.cerrarDetalle.emit(false);
    }

    editar() {
        this.editarEspecialidad.emit(this.edit);
        this.indice.emit(this.index);
    }

    actualizar() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });
    }

    sinVencimiento() {
        this.plex.confirm('¿Desea desactivar el vencimiento de la matricula de esta especialidad?').then((resultado) => {
            if (resultado) {
                if (this.formacion.tieneVencimiento) {
                    this.formacion.tieneVencimiento = false;
                } else {
                    this.formacion.tieneVencimiento = true;
                }
                this.profesional.formacionPosgrado[this.index] = this.formacion;
                this.actualizar();
                this.plex.toast('success', 'La fecha de vencimiento fue desactivada con exito', 'informacion', 1000);
            }
        });
    }

    estaVencida(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[this.profesional.formacionPosgrado.length - 1];
        return ((this.hoy.getTime() - formacionPosgrado.matriculacion[formacionPosgrado.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }

    verificarFecha(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[i];
        if (formacionPosgrado.matriculacion.length) {
            if (formacionPosgrado.revalida) {
                return 'revalida';
            } else {
                if (!formacionPosgrado.matriculado) {
                    return 'suspendida';
                } else {
                    if (!formacionPosgrado.tieneVencimiento) {
                        return 'sinVencimiento';
                    } else {
                        if (this.hoy > formacionPosgrado.matriculacion[formacionPosgrado.matriculacion.length - 1].fin) {
                            return 'vencida';
                        } else {
                            return 'vigente';
                        }
                    }
                }
            }
        }
    }
}
