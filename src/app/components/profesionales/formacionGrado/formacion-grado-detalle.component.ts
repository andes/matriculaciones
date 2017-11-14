// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter } from '@angular/core';
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

// Utils
import { PDFUtils } from './../../../utils/PDFUtils';

@Component({
    selector: 'app-formacion-grado-detalle',
    templateUrl: 'formacion-grado-detalle.html'
})
export class FormacionGradoDetalleComponent {

    @Input() formacion: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();

    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils) { }


    generarCredencial() {

        this._profesionalService.getCredencial(this.profesional.id)
            .subscribe((resp) => {
                const pdf = this._pdfUtils.generarCredencial(resp, this.profesional, this.formacion);
                pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                // this.loading = false;
            });


    }

    matricularProfesional(formacion: any) {
        this._numeracionesService.getOne(formacion.profesion.id)
            .subscribe((num) => {
                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                const oMatriculacion = {
                    matriculaNumero: num[0].proximoNumero + 1,
                    libro: '',
                    folio: '',
                    inicio: new Date(),
                    fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                    revalidacionNumero: formacion.matriculacion.length + 1
                };
                num[0].proximoNumero = num[0].proximoNumero + 1;
                this._numeracionesService.saveNumeracion(num[0])
                .subscribe(newNum => {
                        // console.log('Numeracion Actualizada');
                         this.matriculacion.emit(oMatriculacion);
                     });
            });
    }
}
