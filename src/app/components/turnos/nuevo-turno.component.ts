import {
    ViewChild,
    ElementRef,
    AfterViewInit,
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnInit,
    LOCALE_ID
} from '@angular/core';

import * as Enums from './../../utils/enumerados';

// Services
import { TurnoService } from './../../services/turno.service';
import { AgendaService } from './../../services/agenda.service';

// Interfaces
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';

const jQuery = window['jQuery'] = require('jquery/dist/jquery');
const moment = window['moment'] = require('moment/moment.js');
require('./bootstrap-datepicker/bootstrap-datepicker.js');
require('./bootstrap-datepicker/bootstrap-datepicker.es.min.js');

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'app-nuevo-turno',
    templateUrl: 'nuevo-turno.html',
    providers: [{
         provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class NuevoTurnoComponent implements OnInit, AfterViewInit, OnDestroy {
    private $input: any;
    private $div: any;
    private format: string;
    private agendaConfig: IAgendaMatriculaciones;
    private cantidadTurnosPorHora: number;
    private horariosDisponibles: any[] = [];
    private fechaElegida: Date;
    private turnoElegido: boolean;
    private lblTurno: string;
    private options: any = {};
    public boxType: string;

    @Output() onTurnoSeleccionado = new EventEmitter<Date>();
    @Input() private tipoTurno: Enums.TipoTurno;
    @ViewChild('input') input: ElementRef;
    @ViewChild('div') div: ElementRef;

    constructor(private _element: ElementRef,
        private _turnoService: TurnoService,
        private _agendaService: AgendaService) {}

    /**
     * Lifecycle hooks
     */
    ngOnInit() {
        // Setteo el formato utilizado para las fechas.
        this.format = 'DD/MM/YYYY';
        //moment.locale('es');
    }

    ngAfterViewInit() {
        // Inicio los objetos jQuery.
        this.initjQueryObjects();

        // Obtengo la configuración de la agenda.
        this.getConfiguracionAgenda();
    }

    ngOnDestroy() {
         jQuery(this.div.nativeElement).datepicker('destroy');
    }

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
            this.buildHorariosDisponibles();

            // Obtengo la cantidad de turnos por fecha del mes.
            const hoy = new Date();
            this._turnoService.getTurnosMatriculacion(hoy, {})
                .subscribe((countTurnosXDia) => {
                    this.buildCalendar(countTurnosXDia);
                });
        });
    }

    private buildHorariosDisponibles() {
        if (!this.agendaConfig) {
            return;
        }

        for (let n = this.agendaConfig.horarioInicioTurnos; n <= this.agendaConfig.horarioFinTurnos; n++) {
            if (n !== this.agendaConfig.horarioFinTurnos) {
                for (let nx = 0; nx < (60 / this.agendaConfig.duracionTurno); nx++) {
                    this.horariosDisponibles.push({
                        hora: n,
                        minutos: nx * this.agendaConfig.duracionTurno,
                        ocupado: false
                    });
                }
            } else {
                this.horariosDisponibles.push({
                    hora: n,
                    minutos: 0,
                    ocupado: false
                });
            }
        }
    }

    /**
     * Calendar Methods
     */
     private buildCalendar(countTurnosXDia: any[]) {
        // Inicio las opciones del calendario.
        this.buildCalendarOptions(countTurnosXDia);

        // Inicio el calendario.
        this.$div.datepicker(this.options);

        // Setteo el evento changeDate del calendario.
        this.$div.on('changeDate', (event) => {
            const fecha = new Date(event.date);

            // Limpio el estado de los horarios.
            this.horariosDisponibles.forEach(horario => {
                horario.ocupado = false;
            });

            // Obtengo los horarios ocupados del día.
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

            this.writeValue(fecha);
        });
    }

    private buildCalendarOptions(countTurnosXDia: any[]) {
        this.options = {
            datesDisabled: this.getDatesDisabled(countTurnosXDia), // Fechas deshabilitados.
            weekStart: 1, // La semana empieza los lunes.
            daysOfWeekDisabled: this.getDaysOfWeekDisabled(), // días de la semana deshabilitados (lunes, martes, etc.).
            startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Primera fecha seleccionable
            language: 'es',
            todayHighlight: true // Resaltar la fecha de hoy.
        };
    }

    private getDatesDisabled(countTurnosXDia: any[]) {
        // Fechas excluidas en la configuración de la agenda.
        const fechasExcluidas = this.agendaConfig.fechasExcluidas.map((item) => {
            return moment(item).format(this.format);
        });

        // Si es igual a la cantidad de turnos disponibles del día queda deshabilitdo.
        const diasCompletos = countTurnosXDia.filter((dia) => {
            return dia.count === this.horariosDisponibles.length;
        }).map((dia) => { return dia._id.fechaStr; });

        return fechasExcluidas.concat(diasCompletos);
    }

    private getDaysOfWeekDisabled() {
        const dias = [0, 1, 2, 3, 4, 5, 6];
        if (this.agendaConfig) {
            this.agendaConfig.diasHabilitados.forEach((dia) => {
                const indexOfDia = diasSemana.indexOf(dia.toString()) + 1;
                dias.splice(dias.indexOf(indexOfDia), 1);
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
    }

    confirmTurno() {
        // this.lblTurno = moment(this.fechaElegida).format('llll');
        console.log(this.fechaElegida.getDay())
        this.lblTurno = diasSemana[this.fechaElegida.getDay()] + ' '
            + this.fechaElegida.getDate().toString() + ' de '
            + meses[this.fechaElegida.getMonth()] + ' de '
            + this.fechaElegida.getFullYear() + ', '
            + this.fechaElegida.getHours();

        if (this.fechaElegida.getMinutes() > 0) {
            this.lblTurno += ':' + this.fechaElegida.getMinutes()
        }

        this.lblTurno += ' hs';

        this.boxType = 'success';
        this.turnoElegido = true;
        this.onTurnoSeleccionado.emit(this.fechaElegida);
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
