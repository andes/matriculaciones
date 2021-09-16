import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendaService } from '../../../services/agenda.service';
import { Plex } from '@andes/plex';
import { TurnoService } from '../../../services/turno.service';
import { NuevoTurnoComponent } from '../nuevo-turno.component';

@Component({
    selector: 'app-seleccion-turnos',
    templateUrl: './seleccion-turnos.component.html',
    styleUrls: ['seleccion-turnos.scss']
})
export class SeleccionTurnosComponent implements OnInit {
    inicio = null;
    fin = null;
    tipoTurno = null;
    tipoMatricula = null;
    duracionTurno = null;
    private $input: any;
    private format = 'DD/MM/YYYY';
    public horariosDisponibles: any[] = [];
    public fechaElegida: Date;
    public turnoElegido: boolean;
    public boxType: string;
    public horarioSi = false;
    public horario = new Date();
    public horarioElegido: Date;
    public fecha = new Date();
    public fechaComparacion: Date;
    public sinTurnos = false;

    @Output() onTurnoSeleccionado = new EventEmitter<Date>();
    @ViewChild('input') input: NuevoTurnoComponent;
    @ViewChild('div') div: NuevoTurnoComponent;


    constructor(private route: ActivatedRoute, private _turnoService: TurnoService, private _agendaService: AgendaService, private plex: Plex,
                private router: Router) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.inicio = params['inicio'];
            this.fin = params['fin'];
            this.duracionTurno = parseInt(params['duracionTurno'], 10);
            this.fecha = params['fecha'];
            this.tipoTurno = params['tipoTurno'];
            this.tipoMatricula = params['tipoMatricula'];
            this.horarioSi = false;
            this.horarioElegido = undefined;
            this.onChangeFecha(this.fecha);
        });
    }

    private buildHorariosDisponibles() {
        this.sinTurnos = false;
        this.horariosDisponibles = [];
        let res = null;
        let entradaU = false;
        let minutos = parseInt(moment(this.inicio).format('mm'), 10);
        const minutosFin = parseInt(moment(this.fin).format('mm'), 10);
        const horaInicio = parseInt(moment(this.inicio).format('HH'), 10);
        const horaFin = parseInt(moment(this.fin).format('HH'), 10);
        const horaActual = parseInt(new moment().format('HH'), 10);
        const minutosActual = parseInt(new moment().format('mm'), 10);
        const fechaActual = new Date();
        let n = horaInicio;
        let i = horaInicio;
        let flag = true;
        let nx = 0;
        while (n <= horaFin && flag === true) {
            while (nx < (60 / this.duracionTurno) && flag === true) {
                if (entradaU === false) {
                    entradaU = true;
                } else {
                    if ((i === horaFin) && minutosFin === minutos) {
                        flag = false;
                    } else {
                        const cuenta = this.duracionTurno + minutos;
                        if ((this.duracionTurno + minutos) >= 60) {
                            minutos = (minutos + this.duracionTurno) - 60;
                            i++;
                        } else {
                            if ((this.duracionTurno + minutos) <= 60) {
                                res = minutos + this.duracionTurno;
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

    private onChangeFecha(date: any) {
        const fecha = new Date(date);
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

    buildFechaTurno(turno: any) {
        if (turno && turno.ocupado) {
            this.plex.info('warning', 'El horario no se encuentra disponible');
        } else {
            this.fechaElegida.setHours(turno.hora);
            this.fechaElegida.setMinutes(turno.minutos);
            this.horarioElegido = moment(this.fechaElegida).format('H:mm a');
            if (this.fechaElegida.getHours() !== 0) {
                this.horarioSi = true;
            }
        }
    }

    isActive(turno: any) {
        if ((this.fechaElegida.getHours() === turno.hora) && (this.fechaElegida.getMinutes() === turno.minutos)) {
            return true;
        }
    }

    confirmTurno() {
        this.turnoElegido = true;
        this.onTurnoSeleccionado.emit(this.fechaElegida);

        const params = { fecha: this.fechaElegida };
        if (this.tipoTurno === 'renovacion') {
            this.router.navigate(['/solicitarTurnoRenovacion/seleccion-profesional'], { queryParams: params });
        } else {
            this.router.navigate(['/solicitarTurnoMatriculacion/nuevoProfesional'], { queryParams: params });
        }
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

    volverInicio() {
        if (this.tipoTurno === 'renovacion') {
            this.router.navigate(['/requisitosGenerales']);
        } else {
            if (this.tipoMatricula === 'universitaria') {
                this.router.navigate(['/requisitosMatriculaUniversitaria']);
            } else {
                this.router.navigate(['/requisitosMatriculaTecnicaAuxiliar']);
            }
        }
    }
}
