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

@Component({
    selector: 'app-formacion-grado',
    templateUrl: 'formacion-grado.html'
})
export class FormacionGradoComponent implements OnInit {

    @Input() profesional: IProfesional;
    @Output() formacionGradoSelected = new EventEmitter();
    hoy = null;
    constructor(private _profesionalService: ProfesionalService,
        private _numeracionesService: NumeracionMatriculasService) { }

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
}
