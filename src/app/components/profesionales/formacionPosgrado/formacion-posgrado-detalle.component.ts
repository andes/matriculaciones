
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

    @Input() formacion: IformacionPosgrado;
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
    @Output() anioDeGraciaOutPut = new EventEmitter();
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
    hoy = new Date();
    public showBtnSinVencimiento = false;
    public revalidacion = false;
    public columnasFechas = [];
    public altaObtencion = false;
    public editarObtencion = false;
    public altaRevalida = false;
    public editarRevalida = false;
    ultMat: number;
    ultPer: number;
    public pos;

    constructor(private _profesionalService: ProfesionalService, private plex: Plex, public auth: Auth) { }

    actualizarIndice() {
        const ultMat = this.formacion.matriculacion.length - 1;
        const ultPer = this.formacion.matriculacion[ultMat].periodos.length - 1;
        this.matriculaNumero = this.formacion.matriculacion[ultMat].matriculaNumero;
        this.fechaAlta = this.formacion.matriculacion[ultMat].fechaAlta;
        this.editarObtencion = false;
        this.editarRevalida = false;
        this.inicio = this.formacion.matriculacion[ultMat].periodos[ultPer].inicio;
        this.fin = this.formacion.matriculacion[ultMat].periodos[ultPer].fin;
    }

    ngOnInit() {
        this.hoy = moment().toDate();
        this.esSupervisor = this.auth.getPermissions('matriculaciones:supervisor:?').length > 0;
        this.ultMat = this.formacion.matriculacion.length - 1;
        this.ultPer = this.formacion.matriculacion[this.ultMat].periodos.length - 1;
        if (moment().diff(moment(this.profesional.fechaNacimiento, 'DD-MM-YYYY'), 'years') >= 65) {
            this.showBtnSinVencimiento = true;
        }
    }

    revalidarMatricula() {

        const formacion: IformacionPosgrado = this.formacion;
        let texto: string;

        if (this.puedeRevalidar) {
            if (this.diasAlVencimiento() <= 120) {
                texto = '¿Desea revalidar la matrícula?';
            } else {
                texto = '¿Desea revalidar antes de la fecha de vencimiento?';
            }
        }

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                let revalidaNumero = null;
                const fechaFin = moment(this.inicio).startOf('year').add(5, 'years');
                if (formacion.matriculacion === null) {
                    revalidaNumero = 0;
                } else {
                    if (formacion.matriculacion[this.ultMat].periodos.length) {
                        revalidaNumero = formacion.matriculacion[this.ultMat].periodos.length;
                    } else {
                        revalidaNumero = formacion.matriculacion.length;
                    }
                }
                const periodo: Iperiodos = {
                    inicio: this.inicio,
                    fin: fechaFin.toDate(),
                    revalida: true,
                    revalidacionNumero: revalidaNumero,
                    notificacionVencimiento: false,
                };
                this.formacion.revalida = true;
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index].matriculacion[this.ultMat].periodos.push(periodo);
                this.actualizar();
            }
        });
    }

    renovarMatricula() {

        const formacion: IformacionPosgrado = this.formacion;
        const texto = '¿Desea renovar la Matrícula?';

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                const matriculaNumero = formacion.matriculacion[this.ultMat].matriculaNumero;
                const fechaFin = moment(this.inicio).startOf('year').add(5, 'years');
                const periodo: Iperiodos = {
                    inicio: this.inicio,
                    fin: fechaFin.toDate(),
                    revalida: false,
                    revalidacionNumero: 0,
                    notificacionVencimiento: false,
                };
                const matriculacion: Imatriculacion = {
                    matriculaNumero: matriculaNumero,
                    fechaAlta: this.inicio,
                    baja: { fecha: null, motivo: null },
                    periodos: [periodo]
                };
                this.formacion.revalida = false;
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index].matriculacion.push(matriculacion);
                this.actualizar();
            }
        });
    }

    puedeRenovar() {
        return this.estaVencida() && !this.estaEnAnioGracia();
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

    actualizar() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });
        this.actualizarVariables();
    }

    actualizarVariables() {
        this.ultMat = this.formacion.matriculacion.length - 1;
        this.ultPer = this.formacion.matriculacion[this.ultMat].periodos.length - 1;
        this.fechaAlta = this.formacion.matriculacion[this.ultMat].fechaAlta;
        this.inicio = this.formacion.matriculacion[this.ultMat].periodos[this.ultPer].inicio;
        this.fin = this.formacion.matriculacion[this.ultMat].periodos[this.ultPer].fin;
        this.altaObtencion = false;
        this.altaRevalida = false;
        this.editarObtencion = false;
        this.editarRevalida = false;
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

    estaEnAnioGracia() {
        return this.estaVencida() && (moment().diff(moment(this.fin, 'DD-MM-YYYY'), 'days') < 365);
    }

    puedeRevalidar() {
        return (this.estaVencida() && this.estaEnAnioGracia()) || (this.diasAlVencimiento() > 0 && this.diasAlVencimiento() <= 120);
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
            if (formacionPosgrado.revalida) {
                return 'revalida';
            } else {
                if (!formacionPosgrado.matriculado) {
                    return 'suspendida';
                } else {
                    if (!formacionPosgrado.tieneVencimiento) {
                        return 'sinVencimiento';
                    } else {
                        if (this.hoy > this.fin) {
                            if (this.estaEnAnioGracia()) {
                                return 'anioDeGracia';
                            } else {
                                return 'vencida';
                            }
                        } else {
                            return 'vigente';
                        }
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

    obtenerMatricula() {
        return !this.editarObtencion && !this.editarRevalida && !this.altaRevalida && !this.altaObtencion;
    }

    guardar(event, tipo) {
        if (event.form.valid) {
            const cambio = {
                'op': 'updateEstadoPosGrado',
                'data': this.profesional.formacionPosgrado
            };
            if (tipo === 'matricula') {
                this.formacion.matriculacion[this.ultMat].matriculaNumero = this.matriculaNumero;
                this.formacion.matriculacion[this.ultMat].fechaAlta = this.fechaAlta;
                this.formacion.matriculacion[this.ultMat].periodos[0].inicio = this.fechaAlta;
                this.formacion.matriculacion[this.ultMat].periodos[0].fin = moment(this.fechaAlta).startOf('year').add(5, 'years').toDate();
            } else {
                this.formacion.matriculacion[this.ultMat].periodos[this.ultPer].inicio = this.inicio;
                this.formacion.matriculacion[this.ultMat].periodos[this.ultPer].fin = moment(this.inicio).startOf('year').add(5, 'years').toDate();
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
