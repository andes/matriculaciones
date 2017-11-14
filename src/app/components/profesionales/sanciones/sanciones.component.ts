// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

@Component({
    selector: 'app-sanciones',
    templateUrl: 'sanciones.html'
})
export class SancionesComponent implements OnInit {
    // formSancion: FormGroup;
    @Input() profesional: IProfesional;
    @Output() updateProfesional = new EventEmitter();

    constructor(/*private _formBuilder: FormBuilder*/) {}

    ngOnInit() {
        // this.initForm();
    }

    addSancion(sancion: any) {
        if (this.profesional.sanciones) {
            this.profesional.sanciones.push(sancion);
        } else {
            this.profesional.sanciones = [sancion];
        }
        
        this.updateProfesional.emit(this.profesional);
    }

    /*initForm() {
        this.formSancion = this._formBuilder.group({
            numero: [null, Validators.required],
            sancion: [null],
            motivo: [null, Validators.required],
            normaLegal: [null],
            fecha: [null, Validators.required],
            vencimiento: [null, Validators.required]
        });
    }*/

    /*guardar(sancionModel: any) {
        sancionModel.sancion = sancionModel.sancion.nombre;
        // validaciones
        this.onSaved.emit(sancionModel);
        this.initForm();
    }*/

    /*loadTipoSanciones(event: any) {
        const sanciones = [{
            nombre: 'Apercibimiento',
            id: 1
        },
        {
            nombre: 'Baja de Matrícula',
            id: 2
        },
        {
            nombre: 'Multa',
            id: 3
        },
        {
            nombre: 'Suspensión',
            id: 4
        }];

        event.callback(sanciones);
    }*/
}
