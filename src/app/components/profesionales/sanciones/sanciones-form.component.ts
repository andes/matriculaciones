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
    activeAcc: Boolean = false;
    @Input() profesional: IProfesional;
    @Output() submitSancion = new EventEmitter();
        sanciones: any ={
            numero: null,
            sancion: {
                id: Number,
                nombre: String,
            },
            motivo: null,
            normaLegal: null,
            fecha: null,
            vencimiento: null,
        }
    

    constructor() {}

    ngOnInit() {
      
    }


    onSave() {
        console.log("hola")
       

        this.profesional.sanciones.push(this.sanciones);
        console.log(this.profesional)
        this.submitSancion.emit(this.sanciones);
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
