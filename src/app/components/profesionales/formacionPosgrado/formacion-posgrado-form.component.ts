// Angular
import {
    OnInit,
    Component,
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
import { EntidadFormadoraService } from './../../../services/entidadFormadora.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';
import { ProfesionService } from '../../../services/profesion.service';

@Component({
    selector: 'app-formacion-posgrado-form',
    templateUrl: 'formacion-posgrado-form.html'
})
export class FormacionPosgradoFormComponent implements OnInit {
    formPosgrado: FormGroup;
    activeAcc = false;
    profesiones: any[] = [];
    numeroMenor = false;
    ultimoNumeroMatricula;
    public showOtraEntidadFormadora = false;
    vencimientoAnio = (new Date()).getUTCFullYear() + 5;
    profesionalP: any = {
        exportadoSisa: false,
        profesion: {
            nombre: null,
            codigo: null,
        },
        institucionFormadora: {
            nombre: null,
            codigo: null,
        },
        especialidad: {
            nombre: null,
            codigo: null,
        },
        fechaIngreso: null,
        fechaEgreso: null,
        observacion: null,
        certificacion: {
            fecha: null,
            modalidad: {
                nombre: null,
                codigo: null,
            },
            establecimiento: {
                nombre: null,
                codigo: null,
            },
        },
        papelesVerificados: true,
        matriculado: true,
        revalida: false,
        matriculacion: [{
            matriculaNumero: null,
            libro: '',
            folio: '',
            inicio: new Date(),
            notificacionVencimiento: false,
            fin: new Date(new Date('01/01/2000').setFullYear(this.vencimientoAnio)),
            revalidacionNumero: 1,
        }],
        tieneVencimiento: true,
        fechasDeAltas: [{fecha: new Date()}]
    };

    @Input() profesional: IProfesional;
    @Output() submitPosgrado = new EventEmitter();

    constructor(private _fb: FormBuilder,
        private _siisaSrv: SIISAService,
        private _profSrv: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _modalidadesCertificacionService: ModalidadesCertificacionService,
        private plex: Plex,
        private _profesionalService: ProfesionalService,
    ) { }

    ngOnInit() {
        if (this.profesional) {
            // this.profesiones = this.profesional.formacionGrado.map((value) => {
            //     return value.profesion;
            // });
            this.profesional.formacionGrado.forEach(element => {
                if ( element.profesion.codigo === 1 || element.profesion.codigo === 2 ) {
                    this.profesiones.push(element.profesion);
                  }
            });

        }
    }

    onSubmit($event, form) {
        if ($event.formValid && !this.numeroMenor) {
            this.profesionalP.matriculacion.revalidacionNumero++;
            this.submitPosgrado.emit(this.profesionalP);
            this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);


            // form.resetForm();
        }
    }

    guardarEspecialidad(especialidad: any, valid: boolean) {
        // this.save.emit(especialidad);
    }

    // Selects
    loadEspecialidades(event: any) {
        this._siisaSrv.getEspecialidades(null).subscribe(event.callback);
    }


    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    loadModalidadesCertificacion(event) {
        this._modalidadesCertificacionService.getModalidadesCertificacion().subscribe(event.callback);
    }

    loadEstablecimientosCertificadores(event: any) {
        this._siisaSrv.getEstablecimientosCertificadores(null).subscribe(event.callback);
    }


    ultimaMatricula() {
        this._profesionalService.getUltimoPosgradoNro().subscribe(data => {
            this.ultimoNumeroMatricula = data;
            if (this.profesionalP.matriculacion[0].matriculaNumero <= data) {
                this.numeroMenor = true;
            } else {
                this.numeroMenor = false;
            }
        });
    }

    otraEntidad(f) {
        f.institucionFormadora = {
            nombre: null,
            codigo: null
        };
    }
}
