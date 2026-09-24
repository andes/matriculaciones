
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional, IformacionPosgrado, Imatriculacion, Iperiodos } from './../../../interfaces/IProfesional';
import * as moment from 'moment';
import { ProfesionalService } from './../../../services/profesional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-formacion-posgrado-detalle',
    templateUrl: 'formacion-posgrado-detalle.html',
    styleUrls: ['posGrado.scss']
})
export class FormacionPosgradoDetalleComponent implements OnInit {

    @Input()
    set formacion(value: IformacionPosgrado) {
        this._formacion = value;
        this.tryOpenSuspension();
    }
    get formacion(): IformacionPosgrado {
        return this._formacion;
    }
    @Input()
    set suspensionRequestId(value: number) {
        if (value && value !== this._suspensionRequestId) {
            this._suspensionRequestId = value;
            this.pendingOpenSuspension = true;
            this.tryOpenSuspension();
        }
    }
    @Input('index')
    set _index(value) {
        this.index = value;
        this.actualizarIndice();
    }
    @Input() profesional: IProfesional;
    @Input('nota')
    set nota(value: any) {
        this.notaEditada = value;
    }
    @Output() matriculacion = new EventEmitter();
    @Output() cerrarDetalle = new EventEmitter();
    @Output() editarEspecialidad = new EventEmitter();
    @Output() indice = new EventEmitter();
    public index;
    public esSupervisor;
    public edit = true;
    public matriculaNumero;
    public fechaAlta: Date;
    public inicio: Date;
    public fin: Date;
    public notas = false;
    public _nota = null;
    public notaEditada: any = null;
    public accion = '';
    hoy = moment().endOf('day').toDate();
    public showBtnSinVencimiento = false;
    public revalidacion = false;
    public columnasFechas = [];
    public altaObtencion = false;
    public editarObtencion = false;
    public altaRevalida = false;
    public editarRevalida = false;
    public suspenderMatricula = false;
    public fechaSuspender: Date;
    public motivoSuspender: string;
    ultMat: number;
    ultPer: number;
    public ultimaMatriculacion: Imatriculacion;
    public pos;
    private _formacion: IformacionPosgrado;
    private _suspensionRequestId = 0;
    private pendingOpenSuspension = false;

    constructor(private _profesionalService: ProfesionalService, public plex: Plex, public auth: Auth) { }

    actualizarIndice() {
        if (!this.formacion || !this.formacion.matriculacion || !this.formacion.matriculacion.length) {
            return;
        }
        const ultMat = this.formacion.matriculacion.length - 1;
        const periodo = this.periodoActual();
        this.ultimaMatriculacion = this.formacion.matriculacion[ultMat];
        this.matriculaNumero = this.formacion.matriculacion[ultMat].matriculaNumero;
        this.fechaAlta = this.formacion.matriculacion[ultMat].fechaAlta;
        this.altaObtencion = false;
        this.altaRevalida = false;
        this.editarObtencion = false;
        this.editarRevalida = false;
        this.suspenderMatricula = false;
        this.fechaSuspender = null;
        this.motivoSuspender = null;
        this.inicio = periodo?.inicio || null;
        this.fin = periodo?.fin || null;
        this.tryOpenSuspension();
    }

    /**
     * Devuelve el período vigente de la última matriculación, asegurando que
     * `periodos` exista como array. Para registros con esquema viejo (inicio/fin
     * plano) genera el período en memoria.
     * TODO: remover la generación desde inicio/fin una vez migrados los datos.
     */
    private periodoActual(): Iperiodos {
        const matriculaciones = this.formacion?.matriculacion;
        if (!Array.isArray(matriculaciones) || !matriculaciones.length) {
            return null;
        }
        const matriculacion: any = matriculaciones[matriculaciones.length - 1];
        if (!matriculacion) {
            return null;
        }
        if (!Array.isArray(matriculacion.periodos)) {
            matriculacion.periodos = [];
        }
        if (!matriculacion.periodos.length && (matriculacion.inicio || matriculacion.fin)) {
            matriculacion.periodos.push({
                inicio: matriculacion.inicio,
                fin: matriculacion.fin,
                renovacion: false,
                renovacionNumero: 0,
                notificacionVencimiento: false
            });
        }
        return matriculacion.periodos.length ? matriculacion.periodos[matriculacion.periodos.length - 1] : null;
    }

    ngOnInit() {
        this.hoy = moment().endOf('day').toDate();
        this.esSupervisor = this.auth.getPermissions('matriculaciones:supervisor:?').length > 0;
        this.ultMat = this.formacion?.matriculacion?.length ? this.formacion.matriculacion.length - 1 : -1;
        this.periodoActual();
        const periodos = this.ultMat >= 0 ? this.formacion.matriculacion[this.ultMat].periodos : null;
        this.ultPer = Array.isArray(periodos) && periodos.length ? periodos.length - 1 : -1;
        if (moment().diff(moment(this.profesional.fechaNacimiento, 'DD-MM-YYYY'), 'years') >= 65) {
            this.showBtnSinVencimiento = true;
        }
        this.tryOpenSuspension();
    }

    revalidarMatricula() {

        const formacion: IformacionPosgrado = this.formacion;
        const texto = '¿Desea revalidar la Matrícula?';

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                const matriculaNumero = formacion.matriculacion[this.ultMat].matriculaNumero;
                const fechaFin = moment(this.inicio).startOf('year').add(5, 'years');
                const periodo: Iperiodos = {
                    inicio: this.inicio,
                    fin: fechaFin.toDate(),
                    renovacion: false,
                    renovacionNumero: 0,
                    notificacionVencimiento: false,
                };
                const matriculacion: Imatriculacion = {
                    matriculaNumero: matriculaNumero,
                    fechaAlta: this.inicio,
                    baja: { fecha: null, motivo: null, usuario: null },
                    periodos: [periodo]
                };
                this.formacion.renovacion = false;
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index].matriculacion.push(matriculacion);
                this.actualizar('La matrícula fue revalidada con éxito!');
            }
        });
    }

    renovarMatricula() {

        const formacion: IformacionPosgrado = this.formacion;
        let texto: string;

        if (this.estaVencida()) {
            texto = '¿Desea renovar la matrícula?';
        } else {
            texto = '¿Desea renovar antes de la fecha de vencimiento?';
        }

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                let renovacionNumero = null;
                const fechaFin = moment(this.inicio).startOf('year').add(5, 'years');
                if (formacion.matriculacion === null) {
                    renovacionNumero = 0;
                } else {
                    const ultimaMatriculacion = formacion.matriculacion[this.ultMat];
                    if (!Array.isArray(ultimaMatriculacion.periodos)) {
                        ultimaMatriculacion.periodos = [];
                    }
                    if (ultimaMatriculacion.periodos.length) {
                        renovacionNumero = ultimaMatriculacion.periodos.length;
                    } else {
                        renovacionNumero = formacion.matriculacion.length;
                    }
                }
                const periodo: Iperiodos = {
                    inicio: this.inicio,
                    fin: fechaFin.toDate(),
                    renovacion: true,
                    renovacionNumero: renovacionNumero,
                    notificacionVencimiento: false,
                };
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index].matriculacion[this.ultMat].periodos.push(periodo);
                this.actualizar('La matrícula fue renovada con éxito!');
            }
        });
    }

    puedeRenovar() {
        return this.esRenovar() && (this.estaVencida() || (this.diasAlVencimiento() > 0 && this.diasAlVencimiento() <= 120));
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

    cerrar() {
        this.cerrarDetalle.emit(false);
    }

    editar() {
        this.editarEspecialidad.emit(this.edit);
        this.indice.emit(this.index);
    }

    actualizar(mensaje?: string) {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
            if (mensaje) {
                this.plex.toast('success', mensaje, 'informacion', 1000);
            }
        });
        this.actualizarVariables();
    }

    actualizarVariables() {
        if (!this.formacion?.matriculacion?.length) {
            return;
        }
        this.ultMat = this.formacion.matriculacion.length - 1;
        this.periodoActual();
        const periodos = this.formacion.matriculacion[this.ultMat].periodos;
        this.ultPer = Array.isArray(periodos) && periodos.length ? periodos.length - 1 : -1;
        const periodo = this.ultPer >= 0 ? periodos[this.ultPer] : null;
        this.ultimaMatriculacion = this.formacion.matriculacion[this.ultMat];
        this.fechaAlta = this.formacion.matriculacion[this.ultMat].fechaAlta;
        this.inicio = periodo?.inicio || null;
        this.fin = periodo?.fin || null;
        this.altaObtencion = false;
        this.altaRevalida = false;
        this.editarObtencion = false;
        this.editarRevalida = false;
        this.suspenderMatricula = false;
        this.fechaSuspender = null;
        this.motivoSuspender = null;
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

    estaVencida() {
        return (moment().diff(moment(this.fin), 'days') > 0);
    }

    esRevalida() {
        return moment(this.fin).year() < moment().year();
    }

    esRenovar() {
        return moment(this.fin).year() === moment().year();
    }

    puedeRevalidar() {
        return this.esRevalida() && this.estaVencida();
    }

    diasAlVencimiento() {
        return moment(this.fin).diff(moment(), 'days');
    }

    setIndex(index: number) {
        this.pos = index;
    }

    verificarFecha(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[i];
        if (formacionPosgrado.matriculacion.length) {
            if (!formacionPosgrado.matriculado) {
                return 'suspendida';
            } else {
                if (!formacionPosgrado.tieneVencimiento) {
                    return 'sinVencimiento';
                } else {
                    if (this.hoy > this.fin) {
                        return 'vencida';
                    } else {
                        return 'vigente';
                    }
                }
            }
        }
    }

    RevalidarRenovar() {
        if (this.puedeRevalidar()) {
            this.altaRevalidar();
        } else {
            if (this.puedeRenovar()) {
                this.altaMatricula();
            }
        }
    }

    altaMatricula() {
        this.inicio = moment().toDate();
        this.altaObtencion = true;
    }

    editarMatricula() {
        this.editarObtencion = true;
    }

    altaRevalidar() {
        this.inicio = moment().toDate();
        this.altaRevalida = true;
    }

    editarRevalidar() {
        this.editarRevalida = true;
    }

    abrirSuspension() {
        this.altaObtencion = false;
        this.altaRevalida = false;
        this.editarObtencion = false;
        this.editarRevalida = false;
        this.suspenderMatricula = true;
        this.fechaSuspender = null;
        this.motivoSuspender = null;
    }

    private tryOpenSuspension() {
        if (!this.pendingOpenSuspension || !this.formacion || this.index === undefined || this.index === null) {
            return;
        }
        this.pendingOpenSuspension = false;
        this.abrirSuspension();
    }

    obtenerMatricula() {
        return !this.editarObtencion && !this.editarRevalida && !this.altaRevalida && !this.altaObtencion && !this.suspenderMatricula;
    }

    guardar(event, tipo) {
        if (event.form.valid) {
            const cambio = {
                'op': 'updateEstadoPosGrado',
                'data': this.profesional.formacionPosgrado
            };
            if (tipo === 'matricula') {
                // Renovación: edita el último período de la última matriculación
                const periodoRenovacion = this.periodoActual();
                if (periodoRenovacion) {
                    periodoRenovacion.inicio = this.inicio;
                    periodoRenovacion.fin = moment(this.inicio).startOf('year').add(5, 'years').toDate();
                }
            } else {
                // Revalidación: edita los datos de la nueva matriculación
                this.formacion.matriculacion[this.ultMat].matriculaNumero = this.matriculaNumero;
                this.formacion.matriculacion[this.ultMat].fechaAlta = this.inicio;
                this.periodoActual();
                const periodoRevalida = this.formacion.matriculacion[this.ultMat].periodos[0];
                periodoRevalida.inicio = this.inicio;
                periodoRevalida.fin = moment(this.inicio).startOf('year').add(5, 'years').toDate();
            }
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
                this.plex.toast('success', 'Los datos se han actualizado con éxito!', 'Mensaje de la confirmación', 1000);
            });
            this.actualizarVariables();
        }
    }

    cerrarAlta(tipo) {
        if (tipo === 'matricula') {
            this.altaObtencion = false;
        } else {
            this.altaRevalida = false;
        }
    }

    cerrarEditar(tipo) {
        if (tipo === 'matricula') {
            this.editarObtencion = false;
        } else {
            this.editarRevalida = false;
        }
    }

    suspender() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this.formacion.matriculacion[this.ultMat].baja = {
            fecha: this.fechaSuspender,
            motivo: this.motivoSuspender,
            usuario: this.auth.usuario.nombreCompleto
        };
        this.formacion.matriculado = false;
        this.formacion.papelesVerificados = false;
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
            this.plex.toast('success', 'La matrícula fue suspendida con éxito!', 'informacion', 1000);
            this.actualizarVariables();
        });
    }

    cerrarSuspender() {
        this.suspenderMatricula = false;
        this.fechaSuspender = null;
        this.motivoSuspender = null;
    }

    agregarNota(tipo) {
        this.notas = !this.notas;
        this.accion = tipo;
    }

    guardarNota(eliminar = false) {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        if (eliminar === false) {
            this.formacion.notas[0] = this.notaEditada;
        }
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
            if (this.formacion.notas.length) {
                const mensaje = this.accion === 'agregar' ? 'Nota agregada con éxito!' : 'Nota editada con éxito!';
                this.plex.toast('success', mensaje);
                this.notas = !this.notas;
            } else {
                this.plex.toast('success', 'Nota eliminada con éxito!');
            }
        }, error => {
            this.plex.toast('danger', 'La nota no pudo ser actualizada');
        });
    }

    cancelarNota() {
        this.notaEditada = this.formacion.notas[0];
        this.notas = !this.notas;
    }

    eliminarNota() {
        this.plex.confirm('¿Desea eliminar la Nota?').then((resultado) => {
            if (resultado) {
                this.formacion.notas.splice(0, 1);
                this.guardarNota(true);
            }
        });
    }
}
