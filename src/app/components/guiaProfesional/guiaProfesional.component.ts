// Angular
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

// Plex
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../services/profesional.service';
import * as Enums from './../../utils/enumerados';
import { ProfesionService } from '../../services/profesion.service';



@Component({
    selector: 'app-guia-profesional',
    templateUrl: 'guiaProfesional.html'
})
export class GuiaProfesionalComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public guiaProfesionalEnum;
    public filtro;
    public profEncontrado;
    public mostrarInfo = false;
    public busqueda = {
        nombre: null,
        apellido: null,
        documento: null,
        formacionGrado: null,
        numeroMatricula: null
    };
    constructor(
        private _profesionalService: ProfesionalService,
        private _profesionService: ProfesionService,
        private plex: Plex) { }



    ngOnInit() {
        this.guiaProfesionalEnum = Enums.getObjGuiaProfesional();
    }


    loadProfesiones(event) {
        this._profesionService.getProfesiones().subscribe(event.callback);
    }


    buscar($event) {
        if ($event.formValid) {
            if (this.busqueda.formacionGrado) {
                this.busqueda['codigoProfesion'] = this.busqueda.formacionGrado.codigo;
            }
            this._profesionalService.getGuiaProfesional(this.busqueda).subscribe(x => {
                console.log(x);
                this.profEncontrado = x;
                this.mostrarInfo = true;
            });
        }
    }


    limpiaFiltro() {
        this.busqueda.documento = null;
        this.busqueda.formacionGrado = null;
        this.busqueda.numeroMatricula = null;
        this.busqueda.apellido = null,
        this.busqueda.nombre = null;
    }

}
