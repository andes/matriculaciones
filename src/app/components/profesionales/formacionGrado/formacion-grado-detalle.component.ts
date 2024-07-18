// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ViewChild
} from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

// Services
import { ProfesionalService } from './../../../services/profesional.service';
import { NumeracionMatriculasService } from './../../../services/numeracionMatriculas.service';
import { PlexPanelComponent } from '@andes/plex/src/lib/accordion/panel.component';

// Utils
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import { PDFUtils } from 'src/app/utils/PDFUtils';

@Component({
    selector: 'app-formacion-grado-detalle',
    templateUrl: 'formacion-grado-detalle.html',
    styleUrls: ['grado.scss']
})
export class FormacionGradoDetalleComponent implements OnInit {

    @Input() formacion: any;
    @Input() index: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();
    @Output() cerrarDetalle = new EventEmitter();
    @ViewChild('panelGestion', { static: false }) accordionGestion: PlexPanelComponent;
    @ViewChild('panelBaja', { static: false }) accordionBaja: PlexPanelComponent;
    public esSupervisor;
    public motivoBaja;
    edit = false;
    private hoy = null;
    public edicionBajas = false;
    public edicionGestion = false;
    public edicionRechazo = false;
    public indexGestion;
    public indexBaja;
    public tieneBajas = false;
    public motivoRechazo;
    public campoBaja = false;
    public fechaTemporal = null;
    public motivoTemporal = null;
    public revalidando = false;
    public urlFirma = null;
    public foto = null;
    public tieneFoto = false;
    public matriculaEdit = null;
    public firmaSave = null;
    public fotoSave = null;

    constructor(
        private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils,
        public sanitizer: DomSanitizer,
        private plex: Plex,
        public auth: Auth) { }

    ngOnInit() {
        this.hoy = new Date();
        this.compruebaBajas();
        this.esSupervisor = this.auth?.check('matriculaciones:supervisor:aprobar');
        if (this.formacion.matriculacion && this.formacion.renovacionOnline?.estado !== 'rechazada') {

            this._profesionalService.getProfesionalFirma({ id: this.profesional.id, matricula: this.formacion.matriculacion[this.formacion.matriculacion?.length - 1].matriculaNumero }).pipe(catchError(() => of(null))).subscribe(resp => {
                const base64Data = 'data:image/jpeg;base64,' + resp;
                this.urlFirma = resp.length ? this.sanitizer.bypassSecurityTrustResourceUrl(base64Data) : null;
                this.firmaSave = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
            });

            this._profesionalService.getProfesionalFoto({
                id: this.profesional.id,
                matricula: this.formacion.matriculacion[this.formacion.matriculacion?.length - 1].matriculaNumero
            })
                .pipe(catchError(() => of(null))).subscribe(resp => {
                    if (resp) {
                        const base64Data = 'data:image/jpeg;base64,' + resp;
                        this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                        this.fotoSave = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
                        this.tieneFoto = true;
                    }
                });
        }
    }

    cerrar() {
        this.cerrarDetalle.emit(false);
    }


    matricularProfesional(formacion: any, mantenerNumero) {
        let texto = '¿Desea agregar una nueva matricula?';
        if (mantenerNumero) {
            texto = '¿Desea renovar la matricula?';
        }

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
                let revNumero = null;
                this.revalidando = true;
                if (formacion.matriculacion === null) {
                    revNumero = 0;
                } else {
                    if (formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero) {
                        revNumero = formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero;
                    } else {
                        revNumero = formacion.matriculacion.length;
                    }
                }
                this._numeracionesService.getOne({ codigoSisa: formacion.profesion.codigo })
                    .subscribe((num) => {

                        num = num.data;
                        if (num.length === 0) {
                            this.plex.info('info', 'No tiene ningun numero de matricula asignado');
                        } else {
                            let matriculaNumero;
                            if (!mantenerNumero) {
                                matriculaNumero = num[0].proximoNumero;
                                num[0].proximoNumero = matriculaNumero + 1;
                                this.formacion.fechaDeInscripcion = new Date();
                            }

                            if (mantenerNumero) {
                                matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
                            }
                            const vencimientoAnio: number = moment().year() + 5;
                            const oMatriculacion = {
                                matriculaNumero: matriculaNumero,
                                libro: '',
                                folio: '',
                                inicio: new Date(),
                                baja: {
                                    motivo: '',
                                    fecha: ''
                                },
                                notificacionVencimiento: false,
                                fin: moment(this.profesional.fechaNacimiento).year(vencimientoAnio).toDate(),
                                revalidacionNumero: revNumero + 1
                            };
                            this._numeracionesService.putNumeracion(num[0])
                                .subscribe(newNum => {
                                    this.formacion.renovacion = false;
                                    this.formacion.matriculado = true;
                                    this.profesional.formacionGrado[this.index] = this.formacion;
                                    if (this.profesional.formacionGrado[this.index].matriculacion === null) {
                                        this.profesional.formacionGrado[this.index].matriculacion = [oMatriculacion];
                                    } else {
                                        this.profesional.formacionGrado[this.index].matriculacion.push(oMatriculacion);
                                    }
                                    this.matriculaEdit = matriculaNumero;
                                    this.actualizar();

                                    this.plex.toast('success', 'Se aprobó con exito la renovacion!', 'informacion', 2000);
                                }, () => {
                                    this.plex.toast('danger', 'Se rechazó la renovacion de matrícula!', 'informacion', 2000);
                                });
                        }
                    });

            }
        });
    }

    papelesVerificados() {
        this.formacion.papelesVerificados = true;
        this.formacion.matriculado = false;
        if (this.formacion.renovacionOnline) {
            this.formacion.renovacionOnline = {
                estado: 'aprobada',
                descripcion: 'aprobada',
                fecha: new Date()
            };
        }

        this.profesional.supervisor = {
            id: this.auth.usuario.id,
            nombreCompleto: this.auth.usuario.nombreCompleto
        };
        this.profesional.formacionGrado[this.index] = this.formacion;
        this._profesionalService.putProfesional(this.profesional)
            .subscribe(resp => {
                this.profesional = resp;
                this.plex.toast('success', 'Se guardo con exito el verificar papeles!', 'informacion', 2000);
            }, () => {
                this.plex.toast('danger', 'Error en el guardado de papeles verificados!', 'informacion', 2000);
            });

    }

    rechazarRenovacion() {
        this.edicionRechazo = true;
    }
    opcionRechazarRenovacion() {
        const op = (this.formacion.matriculacion && !this.formacion.papelesVerificados
            && this.formacion.renovacionOnline?.estado === 'pendiente');
        return (op);
    }

    opcionPapelesVerificados() {
        const op = (this.formacion.matriculacion && !this.formacion.papelesVerificados
            && this.formacion.renovacion === true && this.formacion.renovacionOnline?.estado !== 'rechazada');
        return op;

    }
    opcionRenovar() {
        const op = (this.formacion.matriculacion && !this.formacion.matriculado && !this.formacion.papelesVerificados && !this.formacion.renovacion);
        return op;
    }

    renovar() {
        this.formacion.papelesVerificados = false;
        this.formacion.renovacion = true;
        this.formacion.matriculado = true;
        this.profesional.formacionGrado[this.index] = this.formacion;
        this.actualizar();
    }

    editarMatriculacion(index) {
        this.fechaTemporal = this.formacion.matriculacion[index].inicio;
        if (this.campoBaja) {
            this.campoBaja = false;
        }
        if (this.edicionBajas) {
            this.edicionBajas = false;
        }
        this.edicionGestion = true;
        this.indexGestion = index;
        this.accordionGestion.active = false;
        this.accordionBaja ? this.accordionBaja.active = false : null;


    }

    editarBaja(index) {
        this.motivoTemporal = this.formacion.matriculacion[index].baja.motivo;
        this.fechaTemporal = this.formacion.matriculacion[index].baja.fecha;
        if (this.campoBaja) {
            this.campoBaja = false;
        }
        if (this.edicionGestion) {
            this.edicionGestion = false;
        }
        this.edicionBajas = true;
        this.indexBaja = index;
        this.accordionGestion.active = false;
        this.accordionBaja.active = false;

    }

    mostrarBaja() {
        this.motivoBaja = '';
        if (this.edicionBajas) {
            this.cancelarEdicionBaja();
        }
        if (this.edicionGestion) {
            this.edicionGestion = false;
        }
        this.campoBaja = true;
        this.accordionGestion.active = false;
        this.accordionBaja ? this.accordionBaja.active = false : null;


    }
    cancelarBaja() {
        this.campoBaja = false;


    }

    guardarBaja() {
        this.actualizar();
        this.edicionBajas = false;
        this.plex.toast('success', 'La edición se registró con exito!', 'informacion', 1000);

    }

    guardarGestion() {
        const vencimientoAnio: number = moment(this.formacion.matriculacion[this.indexGestion].inicio).year() + 5;
        const fechaNacimiento = moment(this.profesional.fechaNacimiento).hour(0).toDate();
        this.formacion.matriculacion[this.indexGestion].fin = moment(fechaNacimiento).year(vencimientoAnio).toDate();
        this.actualizar();
        this.plex.toast('success', 'La edición se registró con exito!', 'informacion', 1000);
        this.edicionGestion = false;
    }
    guardarRechazo() {
        this.plex.confirm('¿Desea rechazar la renovación de matrícula?').then((resultadoRechazo) => {
            if (resultadoRechazo) {
                if (this.formacion.renovacionOnline) {
                    this.formacion.renovacionOnline = {
                        estado: 'rechazada',
                        descripcion: this.motivoRechazo,
                        fecha: new Date(),
                    };
                    this.profesional.formacionGrado[this.index] = this.formacion;
                    this.profesional.formacionGrado[this.index].matriculado = false;
                    this.firmaSave = null;
                    this.fotoSave = null;
                    this.matriculaEdit = this.formacion.matriculacion[this.formacion.matriculacion?.length - 1].matriculaNumero;
                }

                this.actualizar();
                this.plex.toast('success', 'Se rechazo la renovacion de matricula!', 'informacion', 2000);
                this.edicionRechazo = false;
            }
        });
    }

    cancelarEdicionBaja() {
        this.formacion.matriculacion[this.indexBaja].baja.motivo = this.motivoTemporal;
        this.formacion.matriculacion[this.indexBaja].baja.fecha = this.fechaTemporal;
        this.indexBaja = null;
        this.edicionBajas = false;
    }
    cancelarEdicionRechazo() {
        this.edicionRechazo = false;
        this.actualizar();
    }

    cancelarEdicionGestion() {
        this.formacion.matriculacion[this.indexGestion].inicio = this.fechaTemporal;
        this.edicionGestion = false;
        this.indexGestion = null;
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matrícula?').then((resultado) => {
            if (resultado) {
                this.profesional.formacionGrado[this.index].matriculado = false;
                this.profesional.formacionGrado[this.index].papelesVerificados = false;
                this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.motivo = this.motivoBaja;
                this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.fecha = new Date();
                this.formacion = this.profesional.formacionGrado[this.index];
                this.actualizar();
                this.compruebaBajas();
            }
        });
        this.campoBaja = false;
    }

    renovarAntesVencimiento() {
        this.plex.confirm('¿Desea renovar antes de la fecha del vencimiento?').then((resultado) => {
            if (resultado) {
                this.formacion.papelesVerificados = false;
                this.formacion.renovacion = true;
                this.profesional.formacionGrado[this.index] = this.formacion;
                this.actualizar();
            }
        });
    }

    actualizar() {
        const cambio = {
            'idProfesional': this.profesional.id,
            'op': 'updateEstadoGrado',
            'data': this.profesional.formacionGrado,
            'agente': this.auth.usuario.nombreCompleto,
            'matricula': this.matriculaEdit,
            'firmaP': this.firmaSave,
            'img': this.fotoSave
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {

            this.profesional = data;
        });

    }

    compruebaBajas() {
        let contador = 0;
        if (this.profesional.formacionGrado[this.index].matriculacion) {
            for (let _n = 0; _n < this.profesional.formacionGrado[this.index].matriculacion.length; _n++) {
                if (this.profesional.formacionGrado[this.index].matriculacion[_n].baja && this.profesional.formacionGrado[this.index].matriculacion[_n].baja.motivo !== '') {
                    contador += 1;
                }
            }
            if (contador > 0) {
                this.tieneBajas = true;
            }
        }
    }

}
