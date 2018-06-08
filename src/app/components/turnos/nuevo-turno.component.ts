import {
    ViewChild,
    ElementRef,
    AfterViewInit,
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnChanges,
    OnInit,
    LOCALE_ID
} from '@angular/core';

import * as Enums from './../../utils/enumerados';

// Services
import { TurnoService } from './../../services/turno.service';
import { AgendaService } from './../../services/agenda.service';

// Interfaces
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';
import { Plex } from '@andes/plex';

const jQuery = window['jQuery'] = require('jquery/dist/jquery');
const moment = window['moment'] = require('moment/moment.js');
require('./bootstrap-datepicker/bootstrap-datepicker.js');
require('./bootstrap-datepicker/bootstrap-datepicker.es.min.js');

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'app-nuevo-turno',
    templateUrl: 'nuevo-turno.html',
    styleUrls: ['nuevo-turno.scss'],
    providers: [{
        provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class NuevoTurnoComponent implements OnInit, AfterViewInit, OnChanges {
    private $input: any;
    private $div: any;
    private format: string;
    private agendaConfig: IAgendaMatriculaciones;
    private cantidadTurnosPorHora: number;
    private horariosDisponibles: any[] = [];
    private fechaElegida: Date;
    public turnoElegido: boolean;
    private lblTurno: string;
    private options: any = {};
    public boxType: string;
    public horarioSi = false;
    public horario = new Date();
    public fecha = new Date();
    public fechaComparacion: Date;
    @Input() sobreTurno: any;

    @Output() onTurnoSeleccionado = new EventEmitter<Date>();
    @Input() private tipoTurno: Enums.TipoTurno;
    @ViewChild('input') input: ElementRef;
    @ViewChild('div') div: ElementRef;

    constructor(private _element: ElementRef,
        private _turnoService: TurnoService,
        private _agendaService: AgendaService,
        private plex: Plex) { }

    /**
     * Lifecycle hooks
     */


    ngOnChanges() {
        // this.getConfiguracionAgenda()
    }

    ngOnInit() {
        // Setteo el formato utilizado para las fechas.
        this.format = 'DD/MM/YYYY';

        // moment.locale('es');
        // this.horarioSi = this.fechaElegida.getHours();
    }

    ngAfterViewInit() {
        // Inicio los objetos jQuery.
        if (!this.sobreTurno) {
            this.initjQueryObjects();

            // Obtengo la configuración de la agenda.
            this.getConfiguracionAgenda();
        }
    }

    // ngOnDestroy() {
    //      jQuery(this.div.nativeElement).datepicker('destroy');
    // }

    /**
     * Setup Methods
     */
    private initjQueryObjects() {
        this.$input = jQuery(this.input.nativeElement);
        this.$div = jQuery(this.div.nativeElement);
    }

    /**
     * Config. Agenda Methods
     */
    private getConfiguracionAgenda() {
        this._agendaService.get().subscribe((datos) => {
            this.agendaConfig = datos[0];
            // Calculo los turnos disponibles por día.
            // Obtengo la cantidad de turnos por fecha del mes.
            const hoy = new Date();

            if (this.tipoTurno === Enums.TipoTurno.matriculacion) {

                this._turnoService.getTurnosMatriculacion(hoy, {})
                    .subscribe((countTurnosXDia) => {
                        this.buildCalendar(countTurnosXDia);
                    });
            } else if (this.tipoTurno === Enums.TipoTurno.renovacion) {
                this._turnoService.getTurnosRenovacion(hoy, {})
                    .subscribe((countTurnosXDia) => {
                        this.buildCalendar(countTurnosXDia);
                    });
            }
        });
    }

    private buildHorariosDisponibles() {
        this.horariosDisponibles = [];
        let res = null;
        let entradaU = false;
        let minutos = parseInt(moment(this.agendaConfig.horarioInicioTurnos).format('mm'), 10);
        const horaInicio = parseInt(moment(this.agendaConfig.horarioInicioTurnos).format('HH'), 10);
        const horaFin = parseInt(moment(this.agendaConfig.horarioFinTurnos).format('HH'), 10);
        const horaActual = parseInt(new moment().format('HH'), 10);
        const minutosActual = parseInt(new moment().format('mm'), 10);
        const fechaActual = new Date();
        let n = horaInicio;
        let i = horaInicio;
        let flag = true;
        let nx = 0;
        while (n <= horaFin && flag === true) {
            while (nx < (60 / this.agendaConfig.duracionTurno) && flag === true) {
                if (entradaU === false) {
                    entradaU = true;
                } else {
                    if ((i) === horaFin) {
                        flag = false;
                    } else {
                        if ((this.agendaConfig.duracionTurno + minutos) >= 60) {
                            minutos = (minutos + this.agendaConfig.duracionTurno) - 60;
                            i++;
                        } else {
                            if ((this.agendaConfig.duracionTurno + minutos) <= 60) {
                                res = minutos + this.agendaConfig.duracionTurno;
                            }
                            minutos = res;
                        }
                    }
                }
                if (flag === true) {

                    if (this.fechaComparacion === moment(fechaActual).format('L')) {
                        if (i > horaActual) {
                            this.horariosDisponibles.push({
                                hora: i,
                                minutos: minutos,
                                ocupado: false
                            });
                        }
                        if (i === horaActual) {
                            if (minutos > minutosActual) {
                                this.horariosDisponibles.push({
                                    hora: i,
                                    minutos: minutos,
                                    ocupado: false
                                });
                            }
                        }
                    } else {
                        this.horariosDisponibles.push({
                            hora: i,
                            minutos: minutos,
                            ocupado: false
                        });
                    }
                }
                nx++;
            }
            nx = 0;
            n++;

        }
    }

    private buildCalendar(countTurnosXDia: any[]) {
        // Inicio las opciones del calendario.
        this.buildCalendarOptions(countTurnosXDia);
        // Inicio el calendario.
        this.$div.datepicker(this.options);

        // Setteo el evento changeDate del calendario.
        this.$div.on('changeDate', (event) => {
            const fecha = new Date(event.date);
            this.fechaComparacion = moment(fecha).format('L');
            this.buildHorariosDisponibles();

            // Limpio el estado de los horarios.
            this.horariosDisponibles.forEach(horario => {
                horario.ocupado = false;
            });
            // Obtengo los horarios ocupados del día
            if (this.tipoTurno === Enums.TipoTurno.matriculacion) {
                this._turnoService.getTurnosMatriculacion(fecha, {
                    anio: fecha.getFullYear(),
                    mes: fecha.getMonth() + 1,
                    dia: fecha.getDate()
                }).subscribe((datos) => {
                    // Deshabilito los horarios ocupados.
                    datos.forEach(item => {
                        const turnoOcupado = item._id;
                        this.horariosDisponibles.forEach(horario => {
                            if (horario.hora === turnoOcupado.hora && horario.minutos === turnoOcupado.minutos) {
                                horario.ocupado = true;
                            }
                        });
                    });
                });
            } else if (this.tipoTurno === Enums.TipoTurno.renovacion) {
                this._turnoService.getTurnosRenovacion(fecha, {
                    anio: fecha.getFullYear(),
                    mes: fecha.getMonth() + 1,
                    dia: fecha.getDate()
                }).subscribe((datos) => {
                    // Deshabilito los horarios ocupados.
                    datos.forEach(item => {
                        const turnoOcupado = item._id;
                        this.horariosDisponibles.forEach(horario => {
                            if (horario.hora === turnoOcupado.hora && horario.minutos === turnoOcupado.minutos) {
                                horario.ocupado = true;
                            }
                        });
                    });
                });
            }

            /* this._turnoService.getTurnosMatriculacion(fecha, {
                 anio: fecha.getFullYear(),
                 mes: fecha.getMonth() + 1,
                 dia: fecha.getDate()
             }).subscribe((datos) => {
                     // Deshabilito los horarios ocupados.
                     datos.forEach(item => {
                         const turnoOcupado = item._id;
                         this.horariosDisponibles.forEach(horario => {
                             if (horario.hora === turnoOcupado.hora && horario.minutos === turnoOcupado.minutos) {
                                 horario.ocupado = true;
                             }
                         });
                     });
             });*/

            this.writeValue(fecha);
        });
    }

    private buildCalendarOptions(countTurnosXDia: any[]) {
        this.options = {
            datesDisabled: this.getDatesDisabled(countTurnosXDia), // Fechas deshabilitados.
            weekStart: 0, // La semana empieza los lunes.
            daysOfWeekDisabled: this.getDaysOfWeekDisabled(), // días de la semana deshabilitados (lunes, martes, etc.).
            startDate: new Date(new Date().getTime()), // Primera fecha seleccionable
            language: 'es',
            todayHighlight: true // Resaltar la fecha de hoy.
        };
    }

    private getDatesDisabled(countTurnosXDia: any[]) {

        let res = null;
        if (this.agendaConfig.fechasExcluidas !== null) {
            // Fechas excluidas en la configuración de la agenda.
            const fechasExcluidas = this.agendaConfig.fechasExcluidas.map((item) => {
                return moment(item).format(this.format);
            });

            // Si es igual a la cantidad de turnos disponibles del día queda deshabilitdo.
            const diasCompletos = countTurnosXDia.filter((dia) => {
                return dia.count === this.horariosDisponibles.length;
            }).map((dia) => { return dia._id.fechaStr; });

            res = fechasExcluidas.concat(diasCompletos);
        }

        return res;

    }

    private getDaysOfWeekDisabled() {
        const dias = [0, 1, 2, 3, 4, 5, 6];
        if (this.agendaConfig) {

            this.agendaConfig.diasHabilitados.forEach((dia: any) => {

                const indexOfDia = dias.indexOf((dia.id + 1) % 7);
                dias.splice(indexOfDia, 1);
            });
        }
        return dias.toString();
    }

    /**
     * Actions
     */
    buildFechaTurno(turno: any) {

        this.fechaElegida.setHours(turno.hora);
        this.fechaElegida.setMinutes(turno.minutos);
        if (this.fechaElegida.getHours() !== 0) {
            this.horarioSi = true;
        }
    }

    isActive(turno: any) {
        if ((this.fechaElegida.getHours() === turno.hora) && (this.fechaElegida.getMinutes() === turno.minutos)) {
            return true;
        }
    }
    confirmTurno() {
        this.lblTurno = moment(this.fechaElegida).format('llll');
        this.lblTurno = diasSemana[this.fechaElegida.getDay()] + ' '
            + this.fechaElegida.getDate().toString() + ' de '
            + meses[this.fechaElegida.getMonth()] + ' de '
            + this.fechaElegida.getFullYear() + ', '
            + this.fechaElegida.getHours();

        if (this.fechaElegida.getMinutes() > 0) {
            this.lblTurno += ':' + this.fechaElegida.getMinutes();
        }

        this.lblTurno += ' hs';

        this.boxType = 'success';
        this.turnoElegido = true;
        this.onTurnoSeleccionado.emit(this.fechaElegida);
    }

    confirmSobreTurno() {

        const minutos = this.horario.getMinutes();
        const hora = this.horario.getHours();

        this.fecha.setHours(hora);
        this.fecha.setMinutes(minutos);
        this.lblTurno = moment(this.fecha).format('llll');
        this.lblTurno = diasSemana[this.fecha.getDay()] + ' '
            + this.fecha.getDate().toString() + ' de '
            + meses[this.fecha.getMonth()] + ' de '
            + this.fecha.getFullYear() + ', '
            + this.fecha.getHours();

        if (this.fecha.getMinutes() > 0) {
            this.lblTurno += ':' + this.fecha.getMinutes();
        }

        this.lblTurno += ' hs';

        this.plex.confirm(this.lblTurno).then((resultado) => {
            if (resultado) {
                this.onTurnoSeleccionado.emit(this.fecha);

            }
            // this.boxType = 'success';
            // this.turnoElegido = true;

        });
    }

    private writeValue(date: any) {
        this.fechaElegida = date;
        if (this.fechaElegida) {
            const temp = this.fechaElegida ? moment(this.fechaElegida).format(this.format) : null;
            if (this.$input) {
                this.$input.val(temp);
            }
        }
    }
}
