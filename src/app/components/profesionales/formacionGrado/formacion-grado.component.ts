import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ProfesionalService } from './../../../services/profesional.service';
import { PDFUtils } from '../../../utils/PDFUtils';
import { Auth } from '@andes/auth';
import { ProfesionService } from '../../../services/profesion.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import * as moment from 'moment';
import * as enumerados from './../../../utils/enumerados';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-formacion-grado',
    templateUrl: 'formacion-grado.html',
    styleUrls: ['grado.scss']

})
export class FormacionGradoComponent implements OnInit {

    @Input() profesional: IProfesional;
    @Output() formacionGradoSelected = new EventEmitter();
    hoy = null;
    @Input() tieneFirma = null;
    @Input() tieneFirmaAdmin = null;
    @Output() updateProfesional = new EventEmitter();
    public showOtraEntidadFormadora = false;
    public edit = false;
    public supervisor = {
        id: null,
        nombreCompleto: null
    };
    public credencial = false;
    public formacionSelected;
    public copia = false;
    public copiasObj;
    public copias;
    public indexGrado;
    public fechaImpresion = new Date();
    constructor(private _profesionalService: ProfesionalService,
                public sanitizer: DomSanitizer,
                private _profesionService: ProfesionService,
                private _pdfUtils: PDFUtils, public auth: Auth, private _entidadFormadoraService: EntidadFormadoraService, private plex: Plex) { }

    ngOnInit() {
        this.copiasObj = enumerados.getCopiasCredencial();
        this.hoy = new Date();
        this._profesionalService.getProfesionalFirma({ id: this.profesional.id }).pipe(catchError(() => of(null)))
            .subscribe((respFirma) => {
                this.tieneFirma = respFirma;
                if (this.profesional.supervisor) {
                    this.supervisor.id = this.profesional.supervisor.id;
                    this.supervisor.nombreCompleto = this.profesional.supervisor.nombreCompleto;
                } else {
                    this.supervisor.id = this.auth.usuario.id;
                    this.supervisor.nombreCompleto = this.auth.usuario.nombreCompleto;
                }
                this._profesionalService.getProfesionalFirma({ firmaAdmin: this.supervisor.id }).pipe(catchError(() => of(null)))
                    .subscribe((respFirmaAdmin) => {
                        this.tieneFirmaAdmin = respFirmaAdmin;
                    });
            });
    }

    showFormacion(formacion: any) {
        this.formacionGradoSelected.emit(formacion);
    }

    addFormacionGrado(fGrado: any) {
        this.updateProfesional.emit(fGrado);
    }

    credencialAcciones(i) {
        this.credencial = true;
        this.edit = true;
        this.indexGrado = i;
    }

    generarCredencial() {
        const grado = this.indexGrado;
        this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).pipe(catchError(() => of(null)))
            .subscribe((resp) => {
                if (resp) {
                    const caracteresFoto = resp.split('/');
                    if (caracteresFoto[2].localeCompare('4AAQSkZJRgABAQEASABIAAD')) {
                        const img = 'data:image/jpeg;base64,' + resp;
                        this._profesionalService.getProfesionalFirma({ id: this.profesional.id }).pipe(catchError(() => of(null)))
                            .subscribe((respFirma) => {
                                this._profesionalService.getProfesionalFirma({ firmaAdmin: this.supervisor.id }).pipe(catchError(() => of(null)))
                                    .subscribe((respFirmaAdmin) => {
                                        const firma = 'data:image/jpeg;base64,' + respFirma;
                                        const firmaAdmin = {
                                            firma: 'data:image/jpeg;base64,' + respFirmaAdmin.firma,
                                            administracion: this.supervisor.nombreCompleto
                                        };
                                        this._profesionService.getProfesiones({gestionaColegio: false}).pipe(catchError(() => of(null))).subscribe(datos => {
                                            const seleccionado = datos.filter((p) => p.codigo === this.profesional.formacionGrado[grado].profesion.codigo);
                                            if (!seleccionado.length) {
                                                this.plex.info('warning', 'Error en los datos del profesional');
                                            } else {
                                                if (!this.profesional.formacionGrado[grado].matriculacion[this.profesional.formacionGrado[grado].matriculacion.length - 1].matriculaNumero) {
                                                    this.plex.info('warning', 'El profesional no posee un numero de matrícula');
                                                } else {
                                                    if (!this.supervisor.nombreCompleto) {
                                                        this.plex.info('warning', 'El profesional no posee un supervisor');
                                                    } else {
                                                        if (!respFirmaAdmin.firma) {
                                                            this.plex.info('warning', 'No existe firma del supervisor');
                                                        } else {
                                                            if (!Object.keys(respFirma).length) {
                                                                this.plex.info('warning', 'El profesional no posee una firma');
                                                            } else {
                                                                const pdf = this._pdfUtils.generarCredencial(this.profesional, grado, img, firma, firmaAdmin, seleccionado[0], this.copias, this.fechaImpresion);
                                                                pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                                                            }
                                                        }
                                                    }

                                                }
                                            }
                                        });
                                    });
                            });
                    } else {
                        this.plex.info('warning', 'El profesional no posee una foto');
                    }
                }
            });
    }

    generarCertificadoEtica(i) {
        const grado = this.profesional.formacionGrado[i];
        if (this.profesional.formacionPosgrado && this.profesional.formacionPosgrado.length > 0) {
            const tienePosgrado = this.profesional.formacionPosgrado.findIndex(x => x.profesion.codigo === grado.profesion.codigo && x.matriculado === true);
            if (tienePosgrado !== -1) {
                const pdf = this._pdfUtils.certificadoDeEticaConEspecialidad(this.profesional, grado);
                pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');

            } else {
                const pdf = this._pdfUtils.certificadoDeEtica(this.profesional, grado);
                pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');

            }
        } else {
            const pdf = this._pdfUtils.certificadoDeEtica(this.profesional, grado);
            pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
        }

    }

    actualizar($event) {
        if ($event.formValid) {
            const cambio = {
                'op': 'updateEstadoGrado',
                'data': this.profesional.formacionGrado
            };
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
                this.edit = false;
                this.plex.toast('success', 'Se guardo con exito!', 'informacion', 1000);
            });
        }
    }

    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    cerrarCredencial() {
        this.edit = false;
        this.credencial = false;
        this.copias = null;
        this.copia = false;
    }

    otraEntidad(f) {
        f.entidadFormadora = {
            nombre: null,
            codigo: null
        };
    }

    editar(formacionGrado, i) {
        this.formacionGradoSelected.emit(i);
        this.credencial = false;
        this.edit = true;
        this.formacionSelected = formacionGrado;
        if (this.formacionSelected.entidadFormadora.codigo === null) {
            this.showOtraEntidadFormadora = true;
        } else {
            this.showOtraEntidadFormadora = false;
        }
    }

    pdf(grado) {
        let tipoMatricula;
        if (this.profesional.formacionGrado[grado].matriculacion === null) {
            tipoMatricula = 'MATRICULACION';
        } else {
            if (moment(this.profesional.formacionGrado[grado].matriculacion[0].inicio).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                tipoMatricula = 'MATRICULACION';
            } else {
                tipoMatricula = 'RENOVACION( N° ' + this.profesional.formacionGrado[grado].matriculacion[this.profesional.formacionGrado[grado].matriculacion.length - 1].matriculaNumero + ' )';
            }
        }
        const pdf = this._pdfUtils.comprobanteTurnoDesdeProf(this.profesional, grado, tipoMatricula);
        pdf.save('Turno ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
    }

    verificarEmisionCerificado(i) {
        const formacionGrado = this.profesional.formacionGrado[i];
        if (formacionGrado.matriculacion && !formacionGrado.renovacion) {
            return formacionGrado.matriculacion.length && formacionGrado.matriculado &&
        (this.hoy <= formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) ||
        (!this.verificarFecha(i));
        } else {
            return false;
        }
    }

    verificarVencimiento(i) {
        const formacionGrado = this.profesional.formacionGrado[i];
        if (formacionGrado.matriculacion.length && !formacionGrado.renovacion && formacionGrado.matriculado) {
            if (this.hoy > formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
                return 'vencida';
            } else {
                return 'vigente';
            }
        }
    }
    verificarFecha(i) {
        const formacionGrado = this.profesional.formacionGrado[i];
        return ((this.hoy.getTime() - formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin.getTime()) / (1000 * 3600 * 24) > 365);
    }
}
