import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// Services
import { ProfesionalService } from './../../services/profesional.service';
import { TurnoService } from './../../services/turno.service';

// Utils
import * as Enums from './../../utils/enumerados';
import { IProfesional } from '../../interfaces/IProfesional';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'app-solicitar-turno-renovacion',
    templateUrl: 'solicitar-turno-renovacion.html'
})
export class SolicitarTurnoRenovacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    public tipoTurno: Enums.TipoTurno;
    private formTurno: FormGroup;
    public turnoSeleccionado: boolean;
    public turnoGuardado: boolean;
    private _turnoSeleccionado: Date;
    private _profesionalID: string;
    public _nuevoProfesional: any;
    public id = null;
    public documento;
    public nombre;
    public apellido;
    public profEncontrado: any = [];
    foco = 'sidebar';
    lblTurno: string;

    @Input() public profesional: IProfesional = {
        id: null,
        habilitado: true,
        nombre: null,
        apellido: null,
        tipoDocumento: null,
        documento: null,
        documentoVencimiento: null,
        cuit: null,
        fechaNacimiento: null,
        lugarNacimiento: '',
        nacionalidad: {
            nombre: null,
            codigo: null,
        },
        sexo: undefined,
        contactos: [{
            tipo: 'celular',
            valor: '',
            rank: 0,
            activo: true,
            ultimaActualizacion: new Date()
        }],
        domicilios: [{
            tipo: 'real',
            valor: '',
            codigoPostal: '',
            ubicacion: {
                localidad: null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        },
                     {
                         tipo: 'legal',
                         valor: null,
                         codigoPostal: null,
                         ubicacion: {
                             localidad: null,
                             provincia: null,
                             pais: null,
                         },
                         ultimaActualizacion: new Date(),
                         activo: true
                     },
                     {
                         tipo: 'profesional',
                         valor: null,
                         codigoPostal: null,
                         ubicacion: {
                             localidad: null,
                             provincia: null,
                             pais: null,
                         },
                         ultimaActualizacion: new Date(),
                         activo: true
                     }
        ],
        fotoArchivo: null,
        firmas: null,
        formacionGrado: [{
            profesion: {
                nombre: null,
                codigo: null,
                tipoDeFormacion: null
            },
            entidadFormadora: {
                nombre: null,
                codigo: null,
            },
            titulo: null,
            fechaEgreso: null,
            fechaTitulo: null,
            renovacion: false,
            renovacionOnline: null,
            papelesVerificados: false,
            matriculacion: null,
            matriculado: false
        }],
        formacionPosgrado: null,
        origen: null,
        sanciones: null,
        notas: null,
        rematriculado: 0,
        agenteMatriculador: '',
        OtrosDatos: null,
        idRenovacion: null,
        documentoViejo: null
    };
    public profElegido;
    public noEncontrado = false;


    constructor(
        private _formBuilder: FormBuilder,
        private _turnosService: TurnoService,
        private route: ActivatedRoute,
        private _profesionalService: ProfesionalService
    ) {
        this.tipoTurno = Enums.TipoTurno.renovacion;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = params['id'];
        });
    }

    onTurnoSeleccionado(turno: Date) {
        this._turnoSeleccionado = turno;
        this.turnoSeleccionado = true;
        this.lblTurno = moment(this._turnoSeleccionado).format('llll');
        this.lblTurno = diasSemana[this._turnoSeleccionado.getDay()] + ' '
            + this._turnoSeleccionado.getDate().toString() + ' de '
            + meses[this._turnoSeleccionado.getMonth()] + ' de '
            + this._turnoSeleccionado.getFullYear() + ', '
            + this._turnoSeleccionado.getHours();

        if (this._turnoSeleccionado.getMinutes() > 0) {
            this.lblTurno += ':' + this._turnoSeleccionado.getMinutes();
        }

        this.lblTurno += ' hs';
        if (this.id) {
            this.saveSobreTurno();
        }
    }

    saveSobreTurno() {

        this._profesionalService.getProfesional({ id: this.id }).subscribe(
            (profesional: any) => {
                profesional[0].idRenovacion = this.id;
                profesional[0].id = null;
                delete profesional[0]._id;
                this._turnosService.saveTurnoSolicitados(profesional[0])
                    .subscribe((nuevoProfesional) => {
                        this.formTurno = this._formBuilder.group({
                            fecha: this._turnoSeleccionado,
                            tipo: this.tipoTurno,
                            profesional: nuevoProfesional._id
                        });

                        this._turnosService.saveTurnoMatriculacion({ turno: this.formTurno.value })
                            .subscribe(turno => {
                            });
                    });
            });
    }
}
