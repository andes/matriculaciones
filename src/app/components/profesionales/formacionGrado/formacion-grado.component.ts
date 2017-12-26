// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter, OnInit, OnChanges } from '@angular/core';
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

@Component({
    selector: 'app-formacion-grado',
    templateUrl: 'formacion-grado.html'
})
export class FormacionGradoComponent implements OnInit, OnChanges {

    @Input() profesional: IProfesional;
    @Output() formacionGradoSelected = new EventEmitter();
    hoy = null;
    @Input()  tieneFirma = null;
    @Input()  tieneFirmaAdmin = null;
    @Output() updateProfesional = new EventEmitter();

    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils) { }

    ngOnInit() {
       this.hoy = new Date();
        this.verificaVencimiento();
        this._profesionalService.getProfesionalFirma({id: this.profesional.id})
        .subscribe((respFirma) => {
           this.tieneFirma = respFirma;
       });
       this._profesionalService.getProfesionalFirma({firmaAdmin: this.profesional.id})
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
            this.profesional.formacionGrado.push(fGrado);

        this.updateProfesional.emit(this.profesional);
    }





    /*aprobarProfesional(formacion: any, i: number) {
        this._numeracionesService.getOne(formacion.profesion.codigo.toString())
            .subscribe((num) => {

                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;

                const oMatriculacion = {
                    matriculaNumero: num.proximoNumero++,
                    libro: '',
                    folio: '',
                    inicio: new Date(),
                    fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                    revalidacionNumero: formacion.matriculacion.length + 1
                };

                this.profesional.formacionGrado[i].matriculacion.push(oMatriculacion);

                this._profesionalService.saveProfesional(this.profesional)
                    .subscribe(profesional => {

                        this.profesional = profesional;
                        this._numeracionesService.saveNumeracion(num)
                            .subscribe(newNum => {
                                // console.log('Numeracion Actualizada');
                            });
                    });
            });
    }*/

    generarCredencial(grado) {
        this._profesionalService.getProfesionalFoto({id: this.profesional.id})
        .subscribe((resp) => {
            const img = 'data:image/jpeg;base64,' + resp;
            this._profesionalService.getProfesionalFirma({id: this.profesional.id})
            .subscribe((respFirma) => {
                this._profesionalService.getProfesionalFirma({firmaAdmin: this.profesional.id})
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

    verificaVencimiento() {
        for (var _i = 0; _i < this.profesional.formacionGrado.length; _i++) {
            if (this.profesional.formacionGrado[_i].matriculacion) {
    if (this.profesional.formacionGrado[_i].matriculacion[this.profesional.formacionGrado[_i].matriculacion.length - 1].fin < this.hoy) {
        this.profesional.formacionGrado[_i].matriculado = false;
        this.profesional.formacionGrado[_i].papelesVerificados = false;
                 }
             }
         }
    }

}
