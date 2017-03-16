import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { FileUploader } from 'ng2-file-upload';

import { AppSettings } from './../../app.settings';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';

// Enums
import {
    getEnumAsObjects,
    // Sexo,
    EstadoCivil,
    TipoContacto,
    TipoDomicilio } from './../../utils/enumerados';

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { SexoService } from './../../services/sexo.service';
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';

// Interfaces
import { IProfesional } from './../../interfaces/IProfesional';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: 'detalle-profesional.html'
})
export class DetalleProfesionalComponent implements OnInit, OnChanges {
    public uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto'});
    public uploaderFirma: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto'});
    @Input() profesional: IProfesional;
    @Output() onShowListado = new EventEmitter();

    constructor(private _profesionalService: ProfesionalService,
        private _pdfUtils: PDFUtils,
        private _numeracionesService: NumeracionMatriculasService) {}

    ngOnChanges() {
        if (this.profesional) {
            this.uploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto/' + this.profesional._id});
            this.uploaderFirma = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/firma/' + this.profesional._id});
        }
    }

    ngOnInit() {

        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (response) {
                const oResp = JSON.parse(response);
                this.profesional.foto = oResp.fileName;
                this._profesionalService.saveProfesional(this.profesional)
                    .subscribe(resp => {
                        //console.log(resp)
                    })


            } else {
                console.error('Error subiendo foto');
            }
        };

        this.uploaderFirma.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        this.uploaderFirma.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (response) {
                const oResp = JSON.parse(response);
                this.profesional.firmas.push(oResp);

                this._profesionalService.saveProfesional(this.profesional)
                    .subscribe(resp => {
                        //console.log(resp)
                    });


            } else {
                console.error('Error subiendo firma');
            }
        };
    }

    enviarFoto() {
        this.uploader.uploadAll();
    }

    enviarFirma() {
        this.uploaderFirma.uploadAll();
    }

    guardarNotas(){
        this._profesionalService.saveProfesional(this.profesional)
            .subscribe(resp => {
                //console.log(resp)
            });
    }

    aprobarProfesional() {
        this._numeracionesService.getOne(this.profesional.formacionProfesional.profesion.codigo.toString())
            .subscribe((num) => {
                this.profesional.formacionProfesional.matriculaNumero = num.proximoNumero++;
                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                const fechaFin = new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio);

                const periodoMat = {
                    inicio: new Date(),
                    fin: new Date(fechaFin),
                    numero: this.profesional.formacionProfesional.periodos.length + 1
                };

                this.profesional.formacionProfesional.periodos.push(periodoMat);

                this._profesionalService.saveProfesional(this.profesional)
                    .subscribe(profesional => {

                        this.profesional = profesional;
                        this._numeracionesService.saveNumeracion(num)
                            .subscribe(newNum => {
                                // console.log('Numeracion Actualizada');
                            });
                    });
            });
    }

    volverAlListado() {
        this.onShowListado.emit(true);
    }

    generarCredencial() {
        console.log('Generando Credencial...');
        this._profesionalService.getCredencial(this.profesional._id)
            .subscribe((resp) => {
                const pdf = this._pdfUtils.generarCredencial(resp, this.profesional);
                pdf.save('Credencial ' + this.profesional.nombres + ' ' + this.profesional.apellidos + '.pdf');
            });


    }
}
