// Angular
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges } from '@angular/core';
// Plex
import {
    Plex
} from '@andes/plex';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

@Component({
    selector: 'app-notas-profesional',
    templateUrl: 'notas-profesional.html'
})
export class NotasProfesionalComponent implements OnChanges {
    textoNotas: String;
    @Input() profesional: IProfesional;
    @Output() onSaved = new EventEmitter();


    constructor(private plex: Plex) {
    }

    guardarNotas() {
        this.onSaved.emit(this.textoNotas);
        this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
    }

    ngOnChanges() {
        if (this.profesional) {
            this.textoNotas = this.profesional.notas;

        }
    }
}
