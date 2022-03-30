import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';
@Component({
    selector: 'app-formacion-posgrado',
    templateUrl: 'formacion-posgrado.html',
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
    itemsDropdown: any = [];
    public hoy;
    public edit = true;
    public agregar = true;
    public formacionSelected;
    public proximaFechaDeAlta;
    openedDropDown = null;
    public columns = [
        {
            key: 'nombre',
            label: 'ESPECIALIDAD',
            sorteable: true,
            sort: (a, b) => {
                return a.profesional.formacionPosgrado.especialidad.nombre.localeCompare(b.profesional.formacionPosgrado.especialidad.nombre);
            }
        },
        {
            key: 'matriculaNumero',
            label: 'NRO. DE MATRICULA',
            sorteable: true,
            sort: (a, b) => { return a.profesional.formacionPosgrado.matriculacion.numeroMatricula.localeCompare(b.profesional.formacionPosgrado.matriculacion.numeroMatricula); }
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
    constructor(
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

    setDropDown(i, drop) {
        if (this.openedDropDown) {
            this.openedDropDown.open = (this.openedDropDown === drop) ? true : false;

        }
        this.openedDropDown = drop;
        this.itemsDropdown = [];
        let pos = 0;
        this.itemsDropdown[pos] = { icon: 'lapiz', label: ' EDITAR', handler: () => { this.editarPosgrado(i); } };
        if (this.profesional.formacionPosgrado[i].matriculado && !this.profesional.formacionPosgrado[i].revalida) {
            if (!this.profesional.formacionPosgrado[i].tieneVencimiento) {
                pos++;
                this.itemsDropdown[pos] = { icon: 'calendarios', label: ' ACTIVAR VENCIMIENTO', handler: () => { this.sinVencimiento(i); } };
            } else {
                pos++;
                this.itemsDropdown[pos] = { icon: 'calendarios', label: ' DESACTIVAR VENCIMIENTO', handler: () => { this.sinVencimiento(i); } };
            }
        }
        if (this.profesional.formacionPosgrado[i].matriculado) {
            pos++;
            this.itemsDropdown[pos] = { icon: 'cesto', label: ' DAR DE BAJA', handler: () => { this.darDeBaja(i); } };
        }
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
                // this.profesional = data;
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
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe(() => {
        });
    }

    sinVencimiento(i) {
        if (this.profesional.formacionPosgrado[i].tieneVencimiento) {
            this.plex.confirm('¿Desea desactivar el vencimiento de la matricula de esta especialidad?').then((resultado) => {
                if (resultado) {
                    this.profesional.formacionPosgrado[i].tieneVencimiento = false;
                    this.actualizar();
                }
            });
        } else {
            this.plex.confirm('¿Desea activar el vencimiento de la matricula de esta especialidad?').then((resultado) => {
                if (resultado) {
                    this.profesional.formacionPosgrado[i].tieneVencimiento = true;
                    this.actualizar();
                }
            });
        }
    }

    estaVencida(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[i];
        return ((this.hoy.getTime() - new Date(formacionPosgrado.matriculacion[formacionPosgrado.matriculacion.length - 1].fin).getTime()) / (1000 * 3600 * 24) > 365);
    }

    verificarFecha(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[i];
        if (formacionPosgrado.matriculacion.length) {
            if (formacionPosgrado.revalida) {
                return 'revalida';
            } else {
                if (!formacionPosgrado.matriculado) {
                    return 'suspendida';
                } else {
                    if (!formacionPosgrado.tieneVencimiento) {
                        return 'sinVencimiento';
                    } else {
                        if (this.hoy > formacionPosgrado.matriculacion[formacionPosgrado.matriculacion.length - 1].fin) {
                            return 'vencida';
                        } else {
                            return 'vigente';
                        }
                    }
                }
            }
        }
    }
}
