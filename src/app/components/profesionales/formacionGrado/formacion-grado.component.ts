import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
import { PdfService } from '../../../services/pdf.service';
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
    constructor(
        private _profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
        private _profesionService: ProfesionService,
        private _pdfUtils: PDFUtils,
        public auth: Auth,
        private _entidadFormadoraService: EntidadFormadoraService,
        private plex: Plex,
        private pdfService: PdfService
    ) { }

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
                                        this._profesionService.getProfesiones({ gestionaColegio: false }).pipe(catchError(() => of(null))).subscribe(datos => {
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
    loadProfesiones(event) {
        this._profesionService.getProfesiones({ gestionaColegio: false }).pipe(catchError(() => of(null))).subscribe(event.callback);
    }

    generarCertificadoEtica(i) {
        const grado = this.profesional.formacionGrado[i];
        const profesional = {
            apellido: this.profesional.apellido,
            nombre: this.profesional.nombre,
            documento: this.profesional.documento
        };
        const matricula: any = {
            grado: {
                titulo: grado.titulo,
                matriculaNumero: grado.matriculacion[grado.matriculacion.length - 1].matriculaNumero,
                fechaAlta: grado.fechaDeInscripcion
            }
        };
        const tienePosgrado = this.profesional.formacionPosgrado?.findIndex(x => x.profesion.codigo === grado.profesion.codigo && x.matriculado);
        if (tienePosgrado > -1) {
            // Si tiene posgrados, agregamos los datos principales de cada uno
            const hoy = new Date();
            const posgrados = [];
            this.profesional.formacionPosgrado.forEach(formacion => {
                if (formacion.profesion.codigo === grado.profesion.codigo && formacion.matriculado && !formacion.revalida && (hoy <= formacion.matriculacion[formacion.matriculacion.length - 1].fin || ((hoy.getTime() - formacion.matriculacion[formacion.matriculacion.length - 1].fin?.getTime()) / (1000 * 3600 * 24) < 365) || !formacion.tieneVencimiento)) {
                    posgrados.push({
                        titulo: formacion.especialidad.nombre,
                        matriculaNumero: formacion.matriculacion[formacion.matriculacion.length - 1].matriculaNumero,
                        fechaAlta: formacion.fechasDeAltas[formacion.fechasDeAltas.length - 1].fecha || null
                    });
                }
            });
            if (posgrados.length) {
                matricula.posgrados = posgrados;
            }
        }
        this.pdfService.descargarCertificadoEtica({
            profesional,
            matricula
        },
        'Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf'
        ).subscribe();
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

    verificarVencimiento(index) {
        const formacionGrado = this.profesional.formacionGrado[index];
        if (formacionGrado.matriculacion.length && !formacionGrado.renovacion && formacionGrado.matriculado) {
            if (this.hoy > formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
                return 'vencida';
            } else {
                return 'vigente';
            }
        }
    }
    verificarFecha(index) {
        const formacionGrado = this.profesional.formacionGrado[index];
        return ((this.hoy.getTime() - formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin?.getTime()) / (1000 * 3600 * 24) > 365);
    }
    poseeVerificarPapeles(index) {
        const formacionGrado = this.profesional.formacionGrado[index];
        return (formacionGrado.matriculacion.length && formacionGrado.renovacion && formacionGrado.renovacionOnline?.estado !== 'rechazada');
    }
    poseeRechazoRenovacion(index) {
        const formacionGrado = this.profesional.formacionGrado[index];
        return (formacionGrado.matriculacion.length && formacionGrado.renovacionOnline?.estado === 'rechazada');
    }
}
