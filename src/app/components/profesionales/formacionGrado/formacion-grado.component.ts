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

    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils,public auth: Auth) { }

    ngOnInit() {
        this.hoy = new Date();
        // this.verificaVencimiento();
        this._profesionalService.getProfesionalFirma({ id: this.profesional.id })
            .subscribe((respFirma) => {
                this.tieneFirma = respFirma;
            });
        this._profesionalService.getProfesionalFirma({ firmaAdmin: this.profesional.id })
            .subscribe((respFirmaAdmin) => {
                this.tieneFirmaAdmin = respFirmaAdmin;
            });

    }

    ngOnChanges() {

    }

    showFormacion(formacion: any) {
        this.formacionGradoSelected.emit(formacion);
    }

    addFormacionGrado(fGrado: any) {
        const cambio = {
            'op': 'updateGrado',
            'data': fGrado,
            'agente': this.auth.usuario.nombreCompleto
        };

        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {console.log(data)});
        this.profesional.formacionGrado.push(fGrado);

    }

    generarCredencial(grado) {
        this._profesionalService.getProfesionalFoto({ id: this.profesional.id })
            .subscribe((resp) => {
                const img = 'data:image/jpeg;base64,' + resp;
                this._profesionalService.getProfesionalFirma({ id: this.profesional.id })
                    .subscribe((respFirma) => {
                        this._profesionalService.getProfesionalFirma({ firmaAdmin: this.profesional.id })
                            .subscribe((respFirmaAdmin) => {
                                const firma = 'data:image/jpeg;base64,' + respFirma;
                                const firmaAdmin = {
                                    firma: 'data:image/jpeg;base64,' + respFirmaAdmin.firma,
                                    administracion: respFirmaAdmin.administracion
                                };
                                const pdf = this._pdfUtils.generarCredencial(this.profesional, grado, img, firma, firmaAdmin);
                                pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                                // this.loading = false;
                            });
                    });
            });
    }

    generarCertificadoEtica(i) {
        const grado = this.profesional.formacionGrado[i];
        const pdf = this._pdfUtils.certificadoDeEtica(this.profesional, grado);
        pdf.save('Certificado de etica para ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
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

}
