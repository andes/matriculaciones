import { ViewChild, ElementRef, AfterViewInit, Component, Input, Output, EventEmitter, LOCALE_ID } from '@angular/core';
import * as Enums from './../../utils/enumerados';
// Services
import { TurnoService } from './../../services/turno.service';
import { AgendaService } from './../../services/agenda.service';
// Interfaces
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { stringify } from '@angular/compiler/src/util';
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
  public fechaElegida: Date;
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
  public showSidebar = false;
  cupoDiario = 0;
  @Input() sobreTurno: any;

  @Output() onTurnoSeleccionado = new EventEmitter<Date>();
  @Input() private tipoTurno: Enums.TipoTurno;
  @Input() private tipoMatricula: Enums.TipoMatricula;

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
      // Calculo los turnos disponibles por día.[tipoMatricula]="tipoMatricula"
      // Obtengo la cantidad de turnos por fecha del mes.
      this.fechaConsulta = new Date();
      this.getPrimerDia();
    });

  }

  private onChangeFecha(event: any) {
    this.showSidebar = true;
    this.fechaElegida = new Date(event.date);
    this.fechaComparacion = moment(this.fechaElegida).format('L');
    if (stringify(this.tipoTurno) === 'renovacion') {
      const params = { inicio: this.agendaConfig.horarioInicioTurnos, fin: this.agendaConfig.horarioFinTurnos, duracionTurno: this.agendaConfig.duracionTurno, fecha: this.fechaElegida, tipoTurno: this.tipoTurno };
      this.router.navigate(['/solicitarTurnoRenovacion/seleccion-turnos'], { queryParams: params });
    } else {
      const params = { inicio: this.agendaConfig.horarioInicioTurnos, fin: this.agendaConfig.horarioFinTurnos, duracionTurno: this.agendaConfig.duracionTurno, fecha: this.fechaElegida, tipoTurno: this.tipoTurno, tipoMatricula: this.tipoMatricula };
      this.router.navigate(['/solicitarTurnoMatriculacion/seleccion-turnos'], { queryParams: params });
    }
  }

  private buildCalendarOptions(countTurnosXDia: any[], startDate) {
    this.options = {
      updateViewDate: false,
      datesDisabled: this.diasDeshabilitados(countTurnosXDia), // Fechas deshabilitados.
      weekStart: 0, // La semana empieza los lunes.
      daysOfWeekDisabled: this.getDaysOfWeekDisabled(), // días de la semana deshabilitados (lunes, martes, etc.).
      defaultViewDate: startDate,
      language: 'es',
      todayHighlight: true
    };
    this.$div.datepicker(this.options);
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
    let tiempoTranscurrido = Date.now();
    let hoy = new Date(tiempoTranscurrido);
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
      if (date.getTime() < hoy.getTime() && date.toDateString() !== hoy.toDateString()) {
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
}
