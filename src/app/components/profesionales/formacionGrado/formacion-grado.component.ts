// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter, OnInit, OnChanges
} from '@angular/core';
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
import { PDFUtils } from '../../../utils/PDFUtils';
import { Auth } from '@andes/auth';
import { ProfesionService } from '../../../services/profesion.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import * as moment from 'moment';
import * as enumerados from './../../../utils/enumerados';

@Component({
    selector: 'app-formacion-grado',
    templateUrl: 'formacion-grado.html',
    styles: ['.btnGrado { margin-left: 5px }']
})
export class FormacionGradoComponent implements OnInit, OnChanges {

    @Input() profesional: IProfesional;
    @Output() formacionGradoSelected = new EventEmitter();
    hoy = null;
    @Input() tieneFirma = null;
    @Input() tieneFirmaAdmin = null;
    @Output() updateProfesional = new EventEmitter();
    public showOtraEntidadFormadora = false; ;
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
    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _profesionService: ProfesionService,
        private _pdfUtils: PDFUtils, public auth: Auth, private _entidadFormadoraService: EntidadFormadoraService, ) { }

    ngOnInit() {
        this.copiasObj = enumerados.getCopiasCredencial();
        this.hoy = new Date();
        // this.verificaVencimiento();
        this._profesionalService.getProfesionalFirma({ id: this.profesional.id })
            .subscribe((respFirma) => {
                this.tieneFirma = respFirma;
                if (this.profesional.supervisor) {
                    this.supervisor.id = this.profesional.supervisor.id;
                    this.supervisor.nombreCompleto = this.profesional.supervisor.nombreCompleto;
                }else{
                    this.supervisor.id = this.auth.usuario.id;
                    this.supervisor.nombreCompleto = this.auth.usuario.nombreCompleto;
                }
                this._profesionalService.getProfesionalFirma({ firmaAdmin: this.supervisor.id })
                    .subscribe((respFirmaAdmin) => {
                        this.tieneFirmaAdmin = respFirmaAdmin;
                    });
            });

    }

    ngOnChanges() {

    }

    showFormacion(formacion: any) {
        this.formacionGradoSelected.emit(formacion);
    }

    addFormacionGrado(fGrado: any) {
        // const cambio = {
        //     'op': 'updateGrado',
        //     'data': fGrado,
        //     'agente': this.auth.usuario.nombreCompleto
        // };

        // // this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {});
        // this.profesional.formacionGrado.push(fGrado);
        this.updateProfesional.emit(fGrado);

    }

    credencialAcciones(){
        this.credencial = true;
        this.edit = false;
    }

    generarCredencial(grado) {
        this._profesionalService.getProfesionalFoto({ id: this.profesional.id })
            .subscribe((resp) => {
                const img = 'data:image/jpeg;base64,' + resp;
                this._profesionalService.getProfesionalFirma({ id: this.profesional.id })
                    .subscribe((respFirma) => {
                        this._profesionalService.getProfesionalFirma({ firmaAdmin: this.supervisor.id})
                            .subscribe((respFirmaAdmin) => {
                                const firma = 'data:image/jpeg;base64,' + respFirma;
                                const firmaAdmin = {
                                    firma: 'data:image/jpeg;base64,' + respFirmaAdmin.firma,
                                    administracion: this.supervisor.nombreCompleto
                                };
                                this._profesionService.getProfesiones().subscribe(datos => {
                                    const seleccionado = datos.filter((p) => p.codigo === this.profesional.formacionGrado[grado].profesion.codigo);
                                    const pdf = this._pdfUtils.generarCredencial(this.profesional, grado, img, firma, firmaAdmin, seleccionado[0], this.copias);
                                    pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                                    // this.loading = false;
                                });
                            });
                    });
            });
    }

    generarCertificadoEtica(i) {
        const grado = this.profesional.formacionGrado[i];
        if ( this.profesional.formacionPosgrado && this.profesional.formacionPosgrado.length > 0 ) {
            const tienePosgrado = this.profesional.formacionPosgrado.findIndex(x => x.profesion.codigo === grado.profesion.codigo &&  x.matriculado === true);
            if (tienePosgrado !== -1) {
                const pdf = this._pdfUtils.certificadoDeEticaConEspecialidad(this.profesional, grado);
                pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');

            }else {
                const pdf = this._pdfUtils.certificadoDeEtica(this.profesional, grado);
                pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');

            }
        }else {
            const pdf = this._pdfUtils.certificadoDeEtica(this.profesional, grado);
            pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
        }

    }

    // verificaVencimiento() {
    //     for (var _i = 0; _i < this.profesional.formacionGrado.length; _i++) {
    //         if (this.profesional.formacionGrado[_i].matriculacion) {
    // if (this.profesional.formacionGrado[_i].matriculacion[this.profesional.formacionGrado[_i].matriculacion.length - 1].fin < this.hoy) {
    //     this.profesional.formacionGrado[_i].matriculado = false;
    //     this.profesional.formacionGrado[_i].papelesVerificados = false;
    //     this.updateProfesional.emit(this.profesional);
    //              }
    //          }
    //      }
    // }

    actualizar() {
        const cambio = {
            'op': 'updateEstadoGrado',
            'data': this.profesional.formacionGrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.edit = false;
        });
    }

    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    otraEntidad(f) {
        f.entidadFormadora = {
            nombre: null,
            codigo: null
        };
    }

    editar(formacionGrado) {
        this.edit = true;
        this.formacionSelected = formacionGrado;
        if (this.formacionSelected.entidadFormadora.codigo === null) {
            this.showOtraEntidadFormadora = true;
        } else {
            this.showOtraEntidadFormadora = false;
        }
    }

    pdf(grado) {
        console.log(grado);
        let tipoMatricula;
        if (this.profesional.formacionGrado[grado].matriculacion === null) {
            console.log('matriculacion');
            tipoMatricula = 'MATRICULACION';
        }else{


            // if (moment(this.profesional.formacionGrado[grado].matriculacion[0].inicio).startOf('day').toDate() === moment().startOf('day').toDate()){
                 if ( moment(this.profesional.formacionGrado[grado].matriculacion[0].inicio).format('YYYY-MM-DD') ===  moment().format('YYYY-MM-DD')){
                    tipoMatricula = 'MATRICULACION';
            }else{
                tipoMatricula = 'RENOVACION( N° ' + this.profesional.formacionGrado[grado].matriculacion[this.profesional.formacionGrado[grado].matriculacion.length - 1].matriculaNumero + ' )';
            }
        }
        const pdf = this._pdfUtils.comprobanteTurnoDesdeProf(this.profesional, grado, tipoMatricula);
        pdf.save('Turno ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
    }

}
