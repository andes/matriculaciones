import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../../interfaces/IProfesional';
import { SIISAService } from './../../../services/siisa.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';
@Component({
    selector: 'app-formacion-posgrado',
    templateUrl: 'formacion-posgrado.html',
    styles: ['#matDropdown { display: flex!important}']
})

export class FormacionPosgradoComponent implements OnInit {
    @Input() profesional: IProfesional;
    @Output() formacionPosgradoSelected = new EventEmitter();
    @Output() updateProfesional = new EventEmitter();
    @Output() showPosgradoEdit = new EventEmitter();
    @Output() showPosgradoAdd = new EventEmitter();
    @Output() indice = new EventEmitter();
    public showOtraEntidadFormadora = false;
    public certificacion = {
        modalidad: null,
        fecha: null
    };
    public hoy;
    public edit = true;
    public agregar = true;
    public formacionSelected;
    public proximaFechaDeAlta;
    public columns = [
        {
            key: 'nombre',
            label: 'ESPECIALIDAD'
        },
        {
            key: 'matriculaNumero',
            label: 'NRO. DE MATRICULA'
        },
        {
            key: 'fecha',
            label: 'FECHA DE ALTA'
        },
        {
            key: 'fin',
            label: '',
        },
    ];
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

    editarPosgrado(i) {
        this.showPosgradoEdit.emit(this.edit);
        this.indice.emit(i);
    }

    cargarPosgrado() {
        this.showPosgradoAdd.emit(this.agregar);
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
        if (!this.formacionSelected.institucionFormadora || !this.formacionSelected.institucionFormadora.codigo) {
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

    darDeBaja(i) {
        this.plex.confirm('¿Desea dar de baja esta matricula??').then((resultado) => {
            if (resultado) {
                this.profesional.formacionPosgrado[i].matriculado = false;
                this.profesional.formacionPosgrado[i].papelesVerificados = false;
                this.actualizar();
            }
        });
    }

    actualizar() {
        const cambio = {
            'op': 'updateEstadoPosGrado',
            'data': this.profesional.formacionPosgrado
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.plex.toast('success', 'Se ha eliminado con éxito!', 'informacion', 1000);
        });
    }
}
