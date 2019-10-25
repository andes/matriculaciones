import { ViewChild, ElementRef, AfterViewInit, Component, Input, Output, EventEmitter, LOCALE_ID } from '@angular/core';
import * as Enums from './../../utils/enumerados';
// Services
import { TurnoService } from './../../services/turno.service';
import { AgendaService } from './../../services/agenda.service';
// Interfaces
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
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
export class NuevoTurnoComponent implements AfterViewInit {
  private $input: any;
  private $div: any;
  private format = 'DD/MM/YYYY';
  private agendaConfig: IAgendaMatriculaciones;
  private cantidadTurnosPorHora: number;
  horariosDisponibles: any[] = [];
  private fechaElegida: Date;
  private fechaConsulta: Date;
  public turnoElegido: boolean;
  private lblTurno: string;
  private options: any = {};
  public boxType: string;
  public horarioSi = false;
  public horario = new Date();
  public fecha = new Date();
  public fechaComparacion: Date;
  public sinTurnos = false;
  cupoDiario = 0;
  @Input() sobreTurno: any;

  @Output() onTurnoSeleccionado = new EventEmitter<Date>();
  @Input() private tipoTurno: Enums.TipoTurno;
  @ViewChild('input') input: ElementRef;
  @ViewChild('div') div: ElementRef;

  constructor(private _element: ElementRef,
    private _turnoService: TurnoService,
    private _agendaService: AgendaService,
    private plex: Plex,
    private router: Router) { }


  ngAfterViewInit() {
    // Inicio los objetos jQuery.
    if (!this.sobreTurno) {
      this.initjQueryObjects();
      // Obtengo la configuración de la agenda.
      this.getConfiguracionAgenda();
    }
  }

  /**
   * Setup Methods
   */
  private initjQueryObjects() {
    this.$input = jQuery(this.input.nativeElement);
    this.$div = jQuery(this.div.nativeElement);
    // Setteo el evento changeDate del calendario.
    this.$div.on('changeDate', (event) => {
      this.onChangeFecha(event);
    });
    this.$div.on('changeMonth', (event) => {
      this.changeMonth(event.date);
    });
    this.$div.on('show', (event) => {
    });
  }

  private changeMonth(fecha) {
    this._turnoService.getTurnosMes({ fecha: fecha })
      .subscribe((turnosMes) => {
        jQuery(this.div.nativeElement).datepicker('setDatesDisabled', this.diasDeshabilitados(turnosMes, fecha));
      });
    this.fechaElegida = undefined;
  }
  /**
   * Config. Agenda Methods
   */
  private getConfiguracionAgenda() {
    this._agendaService.get().subscribe((datos) => {
      this.agendaConfig = datos[0];
      const inicio = new Date(this.agendaConfig.horarioInicioTurnos);
      const fin = new Date(this.agendaConfig.horarioFinTurnos);
      const dif = Math.abs(inicio.getTime() - fin.getTime());
      this.cupoDiario = (Math.round((dif / 1000) / 60) / this.agendaConfig.duracionTurno);
      // Calculo los turnos disponibles por día.
      // Obtengo la cantidad de turnos por fecha del mes.
      this.fechaConsulta = new Date();
      this.getPrimerDia();
    });
  }

  private buildHorariosDisponibles() {
    this.sinTurnos = false;
    this.horariosDisponibles = [];
    let res = null;
    let entradaU = false;
    let minutos = parseInt(moment(this.agendaConfig.horarioInicioTurnos).format('mm'), 10);
    const minutosFin = parseInt(moment(this.agendaConfig.horarioFinTurnos).format('mm'), 10);
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
          if ((i === horaFin) && minutosFin === minutos) {
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
            if (minutos === 60) {
              minutos = 0;
              i++;
            }
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

  private onChangeFecha(event: any) {
    const fecha = new Date(event.date);
    this.fechaComparacion = moment(fecha).format('L');
    this.buildHorariosDisponibles();
    // Limpio el estado de los horarios.
    this.horariosDisponibles.forEach(horario => {
      horario.ocupado = false;
    });
    // Obtengo los horarios ocupados del día

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
      const count = this.horariosDisponibles.filter((dia) => {
        return dia.ocupado === true;
      });
      if (count.length === this.horariosDisponibles.length) {
        this.sinTurnos = true;
      }
    });

    this.writeValue(fecha);
  }

  private buildCalendarOptions(countTurnosXDia: any[], startDate) {
    this.options = {
      updateViewDate: false,
      datesDisabled: this.diasDeshabilitados(countTurnosXDia), // Fechas deshabilitados.
      weekStart: 0, // La semana empieza los lunes.
      daysOfWeekDisabled: this.getDaysOfWeekDisabled(), // días de la semana deshabilitados (lunes, martes, etc.).
      startDate: startDate,
      defaultViewDate: startDate,
      language: 'es',
      todayHighlight: true
    };
    this.$div.datepicker(this.options);
    this.$div.datepicker('setDate', startDate);

    this.sinTurnos = false;
    this.onChangeFecha({ date: startDate });
  }
  private getPrimerDia(fecha?) {
    let hayTurnos = false;
    let inicioMes;
    let finMes;
    if (fecha) {
      inicioMes = new Date(new Date(fecha).getFullYear(), new Date(fecha).getMonth(), 1);
      finMes = new Date(new Date(fecha).getFullYear(), new Date(fecha).getMonth() + 1, 0);
    } else {
      inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    }
    const diasDeshabilitados = this.getDaysOfWeekDisabled();
    this._turnoService.getTurnosMes({ fecha: inicioMes })
      .subscribe((turnosMes) => {
        let date = (new Date(inicioMes) > new Date()) ? new Date(inicioMes) : new Date();
        while (date <= finMes && !hayTurnos) {
          const indexDia = date.getDay().toString();
          if (diasDeshabilitados.indexOf(date.getDay().toString()) < 0) {
            // console.log(countTurnosXDia)
            const resultado = turnosMes.filter((dia) => {
              return moment(date).isSame(moment(dia.fecha), 'day');
              // new Date(dia.fecha).getTime() === date.getTime()
            });
            if (resultado.length <= this.cupoDiario) {
              hayTurnos = true;
            }
          }
          date = this.addDays(date, 1);
        }
        if (hayTurnos) {
          this.buildCalendarOptions(turnosMes, this.addDays(date, -1));
        } else {
          this.getPrimerDia(new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1));
        }
      });
  }
  private diasDeshabilitados(countTurnosXDia: any[], fecha?) {
    if (!this.agendaConfig.fechasExcluidas) { this.agendaConfig.fechasExcluidas = []; }
    // Fechas excluidas en la configuración de la agenda.
    const fechasExcluidas = this.agendaConfig.fechasExcluidas.map((item) => {
      return moment(item).format(this.format);
    });
    let inicioMes;
    let finMes;
    if (fecha) {
      inicioMes = new Date(new Date(fecha).getFullYear(), new Date(fecha).getMonth(), 1);
      finMes = new Date(new Date(fecha).getFullYear(), new Date(fecha).getMonth() + 1, 0);
    } else {
      inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    }
    let date = new Date(inicioMes);
    while (date <= finMes) {
      const resultado = countTurnosXDia.filter((dia) => {
        return moment(date).isSame(moment(dia.fecha), 'day');
      });
      if (resultado.length > this.cupoDiario) {
        fechasExcluidas.push(date);
      }
      date = this.addDays(date, 1);
    }
    return fechasExcluidas;
  }

  private addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
        this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
        this.router.navigate(['listarProfesionales']);
      }
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
