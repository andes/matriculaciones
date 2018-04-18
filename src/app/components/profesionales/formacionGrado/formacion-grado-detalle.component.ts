// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit
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

// Utils
import { PDFUtils } from './../../../utils/PDFUtils';

@Component({
    selector: 'app-formacion-grado-detalle',
    templateUrl: 'formacion-grado-detalle.html'
})
export class FormacionGradoDetalleComponent implements OnInit {

    @Input() formacion: any;
    @Input() index: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();
    public motivoBaja;
    private hoy = null;
    public tieneBajas = false;
    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService,
        private _pdfUtils: PDFUtils, private plex: Plex) { }



    ngOnInit() {
        this.hoy = new Date();
        this.compruebaBajas();

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
                } else {
                    revNumero = formacion.matriculacion.length;
                }
                this._numeracionesService.getOne({ profesion: formacion.profesion.id })
                    .subscribe((num) => {
                        if (num.length === 0) {
                            this.plex.alert('No tiene ningun numero de matricula asignado');
                        } else {
                            let matriculaNumero;
                            if (mantenerNumero === false) {
                                matriculaNumero = num[0].proximoNumero;
                                num[0].proximoNumero = matriculaNumero + 1;
                            }

                            if (mantenerNumero) {
                                matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
                            }
                            const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                            const oMatriculacion = {
                                matriculaNumero: matriculaNumero,
                                libro: '',
                                folio: '',
                                inicio: new Date(),
                                baja: {
                                    motivo: '',
                                    fecha: null
                                },
                                notificacionVencimiento: false,
                                fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                                revalidacionNumero: revNumero + 1
                            };
                            this._numeracionesService.putNumeracion(num[0])
                                .subscribe(newNum => {
                                    this.matriculacion.emit(oMatriculacion);
                                });
                            // this.profesional.formacionGrado[this.index].renovacion = false;
                            // this.profesional.formacionGrado[this.index].matriculado = true;
                            this.formacion.renovacion = false;
                            this.formacion.matriculado = true;
                            this.profesional.formacionGrado[this.index] = this.formacion;
                            this.actualizar();
                        }
                    });

            }
        });
    }

    papelesVerificados() {
        // this.profesional.formacionGrado[this.index].papelesVerificados = true;
        this.formacion.papelesVerificados = true;
        this.formacion.matriculado = false;
        this.profesional.formacionGrado[this.index] = this.formacion;
        this.actualizar();

    }

    renovar() {
        // this.profesional.formacionGrado[this.index].papelesVerificados = false;
        // this.profesional.formacionGrado[this.index].renovacion = true;
        this.formacion.papelesVerificados = false;
        this.formacion.renovacion = true;
        this.profesional.formacionGrado[this.index] = this.formacion;
        this.actualizar();
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.profesional.formacionGrado[this.index].matriculado = false;
                this.profesional.formacionGrado[this.index].papelesVerificados = false;
                // tslint:disable-next-line:max-line-length
                this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.motivo = this.motivoBaja;
                this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.fecha = new Date();
                this.actualizar();
                this.compruebaBajas();
            }
        });


    }

    actualizar() {
        const cambio = {
            'op': 'updateEstadoGrado',
            'data': this.profesional.formacionGrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });

        // this._profesionalService.putProfesional(this.profesional)
        // .subscribe(resp => {
        //     this.profesional = resp;
        // });
    }

    compruebaBajas() {
        let contador = 0;
        if (this.profesional.formacionGrado[this.index].matriculacion) {
            for (let _n = 0; _n < this.profesional.formacionGrado[this.index].matriculacion.length; _n++) {
                // tslint:disable-next-line:max-line-length
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
