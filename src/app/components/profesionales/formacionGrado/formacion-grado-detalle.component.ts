// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit} from '@angular/core';
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
export class FormacionGradoDetalleComponent  implements OnInit  {

    @Input() formacion: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();
    private hoy = null;
    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils, private plex: Plex) { }


    // generarCredencial() {

    //     this._profesionalService.getCredencial(this.profesional.id)
    //         .subscribe((resp) => {
    //             const pdf = this._pdfUtils.generarCredencial(resp, this.profesional, this.formacion);
    //             pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
    //             // this.loading = false;
    //         });


    // }
    ngOnInit() {
        this.hoy = new Date();

     }

    matricularProfesional(formacion: any, mantenerNumero) {
        let texto = '¿Desea agregar una nueva matricula?';
        if (mantenerNumero) {
            texto = '¿Desea mantener el numero de la matricula?';
        }

        this.plex.confirm(texto).then((resultado) => {
            if (resultado) {
        let revNumero = null;
        if (formacion.matriculacion === null) {
            revNumero = 0;
        }else {
            revNumero = formacion.matriculacion.length;
        }
        this._numeracionesService.getOne(formacion.profesion.id)
            .subscribe((num) => {
               let  matriculaNumero = num[0].proximoNumero + 1;
                if (mantenerNumero) {
                    matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
                }
                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                const oMatriculacion = {
                    matriculaNumero: matriculaNumero,
                    libro: '',
                    folio: '',
                    inicio: new Date(),
                    fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                    revalidacionNumero: revNumero + 1
                };
                num[0].proximoNumero = num[0].proximoNumero + 1;
                this._numeracionesService.saveNumeracion(num[0])
                .subscribe(newNum => {
                        // console.log('Numeracion Actualizada');
                         this.matriculacion.emit(oMatriculacion);
                     });
            });
            this.formacion.revalida = false;
            this.formacion.matriculado = true;
            this.actualizar();
        }
    });
    }

    papelesVerificados() {
        this.formacion.papelesVerificados = true;

        this.actualizar();
    }

    renovar() {
        this.formacion.revalida = true;
        this.formacion.papelesVerificados = false;
       this.actualizar();
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.formacion.matriculado = false;
                this.actualizar();
            }
        });

    }

    actualizar() {
        this._profesionalService.putProfesional(this.profesional)
        .subscribe(resp => {
             this.profesional = resp;
        });
    }


}
