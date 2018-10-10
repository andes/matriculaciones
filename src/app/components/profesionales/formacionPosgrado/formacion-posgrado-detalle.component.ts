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
import * as moment from 'moment';

// Services
import { ProfesionalService } from './../../../services/profesional.service';
import { NumeracionMatriculasService } from './../../../services/numeracionMatriculas.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-formacion-posgrado-detalle',
    templateUrl: 'formacion-posgrado-detalle.html',
    styleUrls: ['posGrado.scss']
})
export class FormacionPosgradoDetalleComponent implements OnInit {

    @Input() formacion: any;
    @Input() index: any;
    public esSupervisor;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();
    @Output() cerrarDetalle = new EventEmitter();
    public showBtnSinVencimiento = false;
    constructor(private _profesionalService: ProfesionalService,
        private plex: Plex,
        private _numeracionesService: NumeracionMatriculasService, public auth: Auth) {


    }

    ngOnInit() {
        console.log(this.formacion);
        this.esSupervisor = this.auth.getPermissions('matriculaciones:supervisor:?').length > 0;
        // this.esSupervisor = true;

        if (moment().diff(moment(this.profesional.fechaNacimiento, 'DD-MM-YYYY'), 'years') >= 65) {
            this.showBtnSinVencimiento = true;
        }
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


                // this._numeracionesService.getOne({ codigoSisaEspecialidad: formacion.especialidad.codigo })
                //     .subscribe((num) => {

                let matriculaNumero;


                if (mantenerNumero) {
                    matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
                }
                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
                const oMatriculacion = {
                    matriculaNumero: matriculaNumero,
                    libro: this.formacion.matriculacion[formacion.matriculacion.length - 1].libro,
                    folio: this.formacion.matriculacion[formacion.matriculacion.length - 1].folio,
                    inicio: new Date(),
                    notificacionVencimiento: false,
                    fin: new Date(new Date('01/01/2000').setFullYear(vencimientoAnio)),
                    revalidacionNumero: revNumero + 1
                };

                this.formacion.revalida = false;
                this.formacion.matriculado = true;
                this.profesional.formacionPosgrado[this.index] = this.formacion;
                this.actualizar();
                this.matriculacion.emit(oMatriculacion);
            }
            // });

            ;

        });
    }

    // matricularProfesional(formacion: any, mantenerNumero) {
    //     let texto = '¿Desea agregar una nueva matricula?';
    //     if (mantenerNumero) {
    //         texto = '¿Desea mantener el numero de la matricula?';
    //     }

    //     this.plex.confirm(texto).then((resultado) => {
    //         if (resultado) {
    //             let revNumero = null;
    //             if (formacion.matriculacion === null) {
    //                 revNumero = 0;
    //             } else {
    //                 revNumero = formacion.matriculacion.length;
    //             }
    //             console.log(formacion);
    //             // this._numeracionesService.getOne({ codigoSisaEspecialidad: formacion.especialidad.codigo })
    //             //     .subscribe((num) => {
    //                     console.log(num);
    //                     num = num.data;
    //                     if (num.length === 0) {
    //                         this.plex.alert('No tiene ningun numero de matricula asignado');
    //                     } else {
    //                         let matriculaNumero;
    //                         if (mantenerNumero === false) {
    //                             matriculaNumero = num[0].proximoNumero;
    //                             num[0].proximoNumero = matriculaNumero + 1;
    //                         }

    //                         if (mantenerNumero) {
    //                             matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
    //                         }
    //                         const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
    //                         const oMatriculacion = {
    //                             matriculaNumero: matriculaNumero,
    //                             libro: '',
    //                             folio: '',
    //                             inicio: new Date(),
    //                             notificacionVencimiento: false,
    //                             fin: new Date(new Date('01/01/2000').setFullYear(vencimientoAnio)),
    //                             revalidacionNumero: revNumero + 1
    //                         };
    //                         this._numeracionesService.putNumeracion(num[0])
    //                             .subscribe(newNum => {
    //                                 this.matriculacion.emit(oMatriculacion);
    //                             });

    //                         this.formacion.revalida = false;
    //                         this.formacion.matriculado = true;
    //                         this.profesional.formacionPosgrado[this.index] = this.formacion;
    //                         this.actualizar();
    //                     }
    //                 // });

    //             ;
    //         }
    //     });
    // }

    papelesVerificados() {
        this.profesional.supervisor = {
            id: this.auth.usuario.id,
            nombreCompleto: this.auth.usuario.nombreCompleto
        };
        this.formacion.papelesVerificados = true;
        this.formacion.matri = true;
        this.profesional.formacionPosgrado[this.index] = this.formacion;
        // this.actualizar();
    }

    darDeBaja() {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.profesional.formacionPosgrado[this.index].matriculado = false;
                this.profesional.formacionPosgrado[this.index].papelesVerificados = false;
                this.actualizar();
            }
        });

    }

    renovar() {
        if ((this.formacion.matriculacion[this.formacion.matriculacion.length - 1].fin.getFullYear() + 1) > new Date().getFullYear()) {
            console.log('tiene año de gracia');
            this.formacion.papelesVerificados = false;
            this.formacion.revalida = true;
            this.formacion.fechasDeAltas.push({ fecha: new Date() });
            this.profesional.formacionPosgrado[this.index] = this.formacion;
            console.log(this.formacion);
            this.actualizar();
        } else {

            this.formacion.papelesVerificados = false;
            this.formacion.revalida = true;
            this.profesional.formacionPosgrado[this.index] = this.formacion;
            this.actualizar();
        }
    }

    renovarAntesVencimiento() {
        this.plex.confirm('¿Desea renovar antes de la fecha del vencimiento??').then((resultado) => {
            if (resultado) {
                this.formacion.papelesVerificados = false;
                this.formacion.revalida = true;
                this.profesional.formacionPosgrado[this.index].matriculado = false;
                this.profesional.formacionPosgrado[this.index] = this.formacion;
                this.actualizar();
            }
        });
    }


    cerrar() {
        this.cerrarDetalle.emit(false);
    }

    actualizar() {
        // this._profesionalService.putProfesional(this.profesional)
        // .subscribe(resp => {
        //      this.profesional = resp;
        // });

        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });
    }

    sinVencimiento() {
        this.plex.confirm('¿Desea desactivar el vencimiento de la matricula de esta especialidad?').then((resultado) => {
            if (resultado) {
                if (this.formacion.tieneVencimiento) {
                    this.formacion.tieneVencimiento = false;
                } else {
                    this.formacion.tieneVencimiento = true;
                }
                this.profesional.formacionPosgrado[this.index] = this.formacion;
                this.actualizar();
            }
        });
    }
}
