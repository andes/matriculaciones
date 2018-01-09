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

@Component({
    selector: 'app-formacion-posgrado-detalle',
    templateUrl: 'formacion-posgrado-detalle.html'
})
export class FormacionPosgradoDetalleComponent implements OnInit {

    @Input() formacion: any;
    @Input() profesional: IProfesional;
    @Output() matriculacion = new EventEmitter();

    constructor(private _profesionalService: ProfesionalService,
        private plex: Plex,
        private _numeracionesService: NumeracionMatriculasService, ) {


    }

    ngOnInit() {

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
                this._numeracionesService.getOne({ especialidad: formacion.especialidad.id })
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
                                fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                                revalidacionNumero: revNumero + 1
                            };

                            this._numeracionesService.saveNumeracion(num[0])
                                .subscribe(newNum => {
                                    this.matriculacion.emit(oMatriculacion);
                                });
                        }
                    });
                ;
            }
        });
    }
}
