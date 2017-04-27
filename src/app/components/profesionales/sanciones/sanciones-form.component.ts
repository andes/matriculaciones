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
    selector: 'app-sanciones-form',
    templateUrl: 'sanciones-form.html'
})
export class SancionesFormComponent implements OnInit {
    formSancion: FormGroup;
    activeAcc: Boolean = false;
    @Input() profesional: IProfesional;
    @Output() submitSancion = new EventEmitter();

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formSancion = this._formBuilder.group({
            numero: [null, Validators.required],
            sancion: [null],
            motivo: [null, Validators.required],
            normaLegal: [null],
            fecha: [null, Validators.required],
            vencimiento: [null, Validators.required]
        });
    }

    onSave() {
        if (this.formSancion.valid) {
            this.formSancion.value.sancion = this.formSancion.value.nombre;

            //this.profesional.sanciones.push(this.formSancion.value);
            this.submitSancion.emit(this.formSancion.value);
            this.activeAcc = false;
            this.initForm();
        }

        // sancionModel.sancion = sancionModel.sancion.nombre;
        // validaciones
    }

    loadTipoSanciones(event: any) {
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
    }
}
