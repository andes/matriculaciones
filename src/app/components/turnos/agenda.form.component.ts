import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';

// Interfaces
import { IAgendaMatriculaciones } from './../../interfaces/IAgendaMatriculaciones';

// Services
import { AgendaService } from './../../services/agenda.service';

// Enums
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'app-agenda-form',
    templateUrl: 'agenda.form.html'
})

export class AgendaFormComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    currentAgenda: IAgendaMatriculaciones = {
        _id: null,
        diasHabilitados: null,
        horarioInicioTurnos: null,
        horarioFinTurnos: null,
        fechasExcluidas: null,
        duracionTurno: null,
    };

    @Input() agendaAmodificar: any = null;
    dias: any[];
    boxType: String;
    feriados: Array<any>;
    agendas: any;
    agendasDiasHabilitados: any;
    agendasFeriados: any;

    constructor( private agendaService: AgendaService, private plex: Plex) {
            this.feriados  = [];
         }


    ngOnInit() {

        this.agendaService.get().subscribe((datos) => {
            this.agendas = datos;
            this.agendasDiasHabilitados = datos;
            this.agendasFeriados = datos[0].fechasExcluidas;


            if (this.agendaAmodificar !== null) {
                this.currentAgenda = this.agendaAmodificar;
                this.feriados = this.agendaAmodificar.fechasExcluidas;
               this.agendaAmodificar.fechasExcluidas = null;
                }

        });

        // Inicio el select de días de la semana.
        this.dias = enumerados.getObjDias();

        // Busco la config actual.
        /*this.agendaService.get()
            .subscribe(datos => {
                this.currentAgenda = datos[0];
                this.loadFormulario(this.currentAgenda);
            });

        // Inicio el formulario.
        this.loadFormulario();
    }

        */
    }

    agregarFeriado() {
        this.feriados.push(this.currentAgenda.fechasExcluidas);
    }

    eliminarFeriado(idx: number) {
        this.feriados.splice(idx, 1);
    }

    guardarConfiguracion($event, form) {
        if ($event.formValid) {
            this.currentAgenda.fechasExcluidas =  this.feriados;
            let agendaOperation: Observable<IAgendaMatriculaciones>;

            agendaOperation = this.agendaService.save(this.currentAgenda);

              agendaOperation.subscribe(resultado => {
                this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
            });
            form.resetForm();
        }
    }

    traeListado() {
        this.agendaService.get().subscribe((datos) => {
            console.log(datos); });
    }


    }

