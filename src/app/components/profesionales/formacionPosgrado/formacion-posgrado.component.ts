import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional, Icertificacion, IformacionPosgrado, Imatriculacion, Iperiodos } from './../../../interfaces/IProfesional';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from '../../../services/entidadFormadora.service';
import { ModalidadesCertificacionService } from '../../../services/modalidadesCertificacion.service';
import * as moment from 'moment';

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
    public certificacion: Icertificacion;
    itemsDropdown: any = [];
    public hoy;
    public edit = true;
    public agregar = true;
    public formacionSelected: IformacionPosgrado;
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
        if (this.profesional.formacionPosgrado[i].matriculado && !this.profesional.formacionPosgrado[i].revalida) {
            if (!this.profesional.formacionPosgrado[i].tieneVencimiento) {
                this.itemsDropdown[pos] = { icon: 'calendarios', label: ' ACTIVAR VENCIMIENTO', handler: () => { this.sinVencimiento(i); } };
                pos++;
            } else {
                this.itemsDropdown[pos] = { icon: 'calendarios', label: ' DESACTIVAR VENCIMIENTO', handler: () => { this.sinVencimiento(i); } };
                pos++;
            }
        }
        if (this.profesional.formacionPosgrado[i].matriculado) {
            this.itemsDropdown[pos] = { icon: 'cesto', label: ' DAR DE BAJA', handler: () => { this.darDeBaja(i); } };
            pos++;
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
                this.edit = false;
                this.plex.toast('success', 'Se guardó con exito!', 'informacion', 1000);
            });
        }
    }

    otraEntidad(f) {
        f.institucionFormadora = {
            nombre: null,
            codigo: null
        };
    }

    editar(formacionPosgrado: IformacionPosgrado, index) {
        this.formacionPosgradoSelected.emit(index);

        this.edit = true;
        if (formacionPosgrado.certificacion) {
            this.certificacion = formacionPosgrado.certificacion;

        } else {
            const certificacion: Icertificacion = {
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
        const ultMat = formacionPosgrado.matriculacion.length - 1;
        const ultPer = formacionPosgrado.matriculacion[ultMat].periodos.length - 1;
        return (moment().diff(moment(formacionPosgrado.matriculacion[ultMat].periodos[ultPer].fin, 'DD-MM-YYYY'), 'days') > 0);
    }

    estaEnAnioGracia(i) {
        const formacionPosgrado = this.profesional.formacionPosgrado[i];
        const ultMat = formacionPosgrado.matriculacion.length - 1;
        const ultPer = formacionPosgrado.matriculacion[ultMat].periodos.length - 1;
        return (this.estaVencida(i) && moment().diff(moment(formacionPosgrado.matriculacion[ultMat].periodos[ultPer].fin, 'DD-MM-YYYY'), 'days') < 365);
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
                        const ultMat = formacionPosgrado.matriculacion.length - 1;
                        const ultPer = formacionPosgrado.matriculacion[ultMat].periodos.length - 1;
                        if (this.hoy > formacionPosgrado.matriculacion[ultMat].periodos[ultPer].fin) {
                            if (this.estaVencida(i) && !this.estaEnAnioGracia(i)) {
                                return 'vencida';
                            } else {
                                return 'anio de gracia';
                            }
                        } else {
                            return 'vigente';
                        }
                    }
                }
            }
        }
    }
}
