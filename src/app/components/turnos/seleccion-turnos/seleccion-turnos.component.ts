import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IAgendaMatriculaciones } from '../../../interfaces/IAgendaMatriculaciones';
import { Plex } from '@andes/plex';
import { TurnoService } from '../../../services/turno.service';

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-seleccion-turnos',
  templateUrl: './seleccion-turnos.component.html'
})
export class SeleccionTurnosComponent implements OnInit {
  inicio = null;
  fin = null;
  private format = 'DD/MM/YYYY';
  private agendaConfig: IAgendaMatriculaciones;
  private cantidadTurnosPorHora: number;
  private horariosDisponibles: any[] = [];
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

  @Output() onTurnoSeleccionado = new EventEmitter<Date>();
  @ViewChild('input') input: ElementRef;

  constructor(private route: ActivatedRoute, private _turnoService: TurnoService, private plex: Plex,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.inicio = params['inicio'];
      this.fin = params['fin'];
      this.fecha = params['fecha'];

      console.log(this.fecha, this.inicio, this.fin)
      this.onChangeFecha(this.fecha);
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

    this.writeValue(fecha);

  }

  private onChangeFecha(fechaa: any) {
    const fecha = new Date(fechaa.date);
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
  }

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
