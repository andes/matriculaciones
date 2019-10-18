// Angular
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

// Plex
import { Plex } from '@andes/plex';

// Interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ISiisa } from './../../../interfaces/ISiisa';

// Services
import { SIISAService } from './../../../services/siisa.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';

@Component({
    selector: 'app-formacion-posgrado',
    templateUrl: 'formacion-posgrado.html'
})
export class FormacionPosgradoComponent implements OnInit {
    // formPosgrado: FormGroup;
    profesiones: any[];
    // accordionActive = false;
    public resultado: boolean;

    @Input() profesional: IProfesional;
    @Output() formacionPosgradoSelected = new EventEmitter();
    @Output() updateProfesional = new EventEmitter();
    public showOtraEntidadFormadora = false;

    public certificacion = {
        modalidad: null,
        fecha: null
    };
    public hoy;
    public edit = false;
    public formacionSelected;
    public proximaFechaDeAlta;
    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _modalidadesCertificacionService: ModalidadesCertificacionService,
        private plex: Plex) { }

    saveProfesional(formacionPosgradoEntrante: any) {
        if (this.profesional.formacionPosgrado) {
            this.profesional.formacionPosgrado.push(formacionPosgradoEntrante);
        } else {
            this.profesional.formacionPosgrado = [formacionPosgradoEntrante];
        }

        this.updateProfesional.emit(this.profesional);

    }

    ngOnInit() {
        this.hoy = new Date();
    }




    showPosgrado(posgrado: any) {
        this.formacionPosgradoSelected.emit(posgrado);
    }


    borrarPosgrado(i) {
        this.profesional.formacionPosgrado.splice(i, 1);
        this.updateProfesional.emit(this.profesional);
    }


    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    loadModalidadesCertificacion(event) {
        this._modalidadesCertificacionService.getModalidadesCertificacion().subscribe(event.callback);
    }


    confirm(i) {
        this.plex.confirm('¿Desea eliminar?').then((resultado) => {
            if (resultado) {
                this.borrarPosgrado(i);
            }
        });
    }

    guardar(event) {
        if (event.formValid) {
            this.formacionSelected.certificacion = this.certificacion;
            const cambio = {
                'op': 'updateEstadoPosGrado',
                'data': this.profesional.formacionPosgrado
            };
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
                this.edit = false;
                this.plex.toast('success', 'Se guardo con exito!', 'informacion', 1000);
            });
        }
    }

    otraEntidad(f) {
        f.institucionFormadora = {
            nombre: null,
            codigo: null
        };
    }

    editar(formacionPosgrado, index) {
        // this.formacionPosgradoSelected.emit(index);
        this.formacionPosgradoSelected.emit(index);

        this.edit = true;
        if (formacionPosgrado.certificacion) {
            this.certificacion = formacionPosgrado.certificacion;

        } else {
            const certificacion = {
                fecha: null,
                modalidad: {
                    nombre: null,
                    codigo: null,
                },
                establecimiento: {
                    nombre: null,
                    codigo: null,
                }
            };
            this.certificacion = certificacion;
        }
        this.formacionSelected = formacionPosgrado;
        if (this.formacionSelected.institucionFormadora.codigo === null) {
            this.showOtraEntidadFormadora = true;
        } else {
            this.showOtraEntidadFormadora = false;
        }
    }

    pushFechasAlta() {
        this.plex.confirm('¿Desea agregar esta nueva fecha de alta?').then((resultado) => {
            if (resultado) {
                this.formacionSelected.fechasDeAltas.push({ fecha: this.proximaFechaDeAlta });
                const cambio = {
                    'op': 'updateEstadoPosGrado',
                    'data': this.profesional.formacionPosgrado
                };
                this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
                });
            }
        });

    }
}
