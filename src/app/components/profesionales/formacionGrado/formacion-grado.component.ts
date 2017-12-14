// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter, OnInit } from '@angular/core';
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
export class FormacionGradoComponent implements OnInit {

    @Input() profesional: IProfesional;
    @Output() formacionGradoSelected = new EventEmitter();
    hoy = null;
    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils) { }

    ngOnInit() {
       this.hoy = new Date();


    }

    showFormacion(formacion: any) {
        this.formacionGradoSelected.emit(formacion);
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
                                const img = 'data:image/jpeg;base64,'+ resp;
                                this._profesionalService.getProfesionalFirma({id: this.profesional.id})
                                .subscribe((respFirma) => {
                                    const firma = 'data:image/jpeg;base64,'+ respFirma;

                                    const pdf = this._pdfUtils.generarCredencial(this.profesional,grado,img, firma);
                                    pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                                    // this.loading = false;
                               });
                           });
                    }

    // verificaVencimiento(){
        // falta terminar
    //     for (var _i = 0; _i < this.profesional.formacionGrado.length; _i++) {
    //         if(this.profesional.formacionGrado[_i].matriculacion){
    // if(this.profesional.formacionGrado[_i].matriculacion[this.profesional.formacionGrado[_i].matriculacion.length - 1].fin > this.hoy){
    //                  console.log("si");
    //              }
    //          }
    //      }
    // }
}
