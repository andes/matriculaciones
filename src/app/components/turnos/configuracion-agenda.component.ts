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
    selector: 'app-configuracion-agenda',
    templateUrl: 'configuracion-agenda.html'
})

export class ConfiguracionAgendaComponent implements OnInit {


    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    currentAgenda: IAgendaMatriculaciones = {
        id: null,
        diasHabilitados: null,
        horarioInicioTurnos: null,
        horarioFinTurnos: null,
        fechasExcluidas: null,
        duracionTurno: null,
    };
    dias: any[];
    boxType: String;
    feriados: Array<any>;
    agendas: any;
    agendasDiasHabilitados: any;
    agendaSelect: any;
    agendaActual = true;
    mostrar = false;
    constructor(private agendaService: AgendaService, private plex: Plex) {
        this.feriados = [];
    }

    ngOnInit() {


        this.traeListado();


        // Inicio el select de días de la semana.
        this.dias = enumerados.getObjDias();

        // Busco la config actual.
    /* this.agendaService.get()
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
        if (this.currentAgenda.fechasExcluidas === null) {
            this.currentAgenda.fechasExcluidas = [];
        }
        this.feriados.push(this.currentAgenda.fechasExcluidas);
    }

    eliminarFeriado(idx: number) {
        this.feriados.splice(idx, 1);
    }

    guardarConfiguracion($event, form) {
        if ($event.formValid) {
            if (this.currentAgenda.fechasExcluidas === null) {
                this.currentAgenda.fechasExcluidas = [];
            }
            this.currentAgenda.fechasExcluidas = this.feriados;
            const agendaOperation = this.agendaService.save(this.currentAgenda);
            agendaOperation.subscribe(resultado => {
                this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
            });
            form.resetForm();
        }
    }

    traeListado() {
        this.agendaService.get().subscribe((datos) => {
            this.agendas = datos;
            this.agendasDiasHabilitados = datos;
        });
    }

    showEditar(agenda) {
        this.mostrar = true;
        this.agendaSelect = agenda;
    }

    showListar() {
        this.mostrar = false;
        this.traeListado();
    }

    insertar(agenda) {
        this.agendas = [agenda];
    }


    mostrarAgendaActual() {
        this.agendaActual = !this.agendaActual;
    }

}

