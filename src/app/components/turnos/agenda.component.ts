import { Component, OnInit} from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
import { AgendaService } from './../../services/agenda.service';
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';
import * as enumerados from './../../utils/enumerados';
import { BreakpointObserver } from '@angular/cdk/layout';
@Component({
    selector: 'app-agenda',
    templateUrl: 'agenda.html'
})
export class AgendaComponent implements OnInit{
    currentAgenda: IAgendaMatriculaciones = {
        id: null,
        diasHabilitados: null,
        horarioInicioTurnos: null,
        horarioFinTurnos: null,
        fechasExcluidas: null,
        duracionTurno: null,
    };
    public columnasFechas = [
        {
            key: 'dias',
            label: 'DÍAS'
        },
        {
            key: 'horario',
            label: 'HORARIO'
        },
        {
            key: 'duracion',
            label: 'DURACIÓN'
        },
        {}
    ];

    public columnasFeriados = [
        {
            key: 'fechas',
            label: 'FECHAS'
        },
        {}
    ];
    dias: any[];
    diasHabiles = '';
    feriados: Array<any>;
    feriadoNuevo;
    mostrarFechas = true;
    agendas: any;
    agendasDiasHabilitados: any;
    agendaActual = true;
    mostrar = false;
    constructor(private agendaService: AgendaService, private plex: Plex, private breakpointObserver: BreakpointObserver) {
        this.feriados = [];
    }
    ngOnInit(){
        this.traeListado();
        // Inicio el select de días de la semana.
        this.dias = enumerados.getObjDias();
    }

    agregarFeriado(event) {
        if (event.valid) {
            if (this.currentAgenda.fechasExcluidas === null) {
                this.currentAgenda.fechasExcluidas = [];
            }
            this.currentAgenda.fechasExcluidas.push(this.feriadoNuevo);
            this.agendaService.save(this.currentAgenda).subscribe(() => {
                this.plex.toast('success', 'Feriado agregado con exito', 'informacion', 1000);
                this.addFeriados();
            });
        }
    }

    eliminarFeriado(idx: number) {
        this.currentAgenda.fechasExcluidas.splice(idx, 1);
        this.agendaService.save(this.currentAgenda).subscribe(() => {
            this.plex.toast('success', 'Feriado eliminado con exito', 'informacion', 1000);
        });
    }

    guardarConfiguracion(event) {
        if (event.valid) {
            this.agendaService.save(this.currentAgenda).subscribe(() => {
                this.plex.toast('success', 'Agenda editada con exito', 'informacion', 1000);
                this.showEditar();
                this.traeListado();
            });
        }
    }

    traeListado() {
        this.agendaService.get().subscribe((datos) => {
            this.diasHabiles='';
            datos[0].diasHabilitados.forEach((dia: any) => this.diasHabiles = this.diasHabiles + dia.nombre + '|');
            this.diasHabiles=this.diasHabiles.slice(0, -1);
            this.agendas = datos;
            this.currentAgenda = datos[0];
            this.agendasDiasHabilitados = datos;
        });
    }

    showEditar() {
        this.mostrar = !this.mostrar;
    }

    addFeriados(){
        this.mostrarFechas = !this.mostrarFechas;
    }

    isMobile() {
        return this.breakpointObserver.isMatched('(max-width: 599px)');
    }
}
