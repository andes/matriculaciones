import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
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
    currentAgenda: IAgendaMatriculaciones = {
        _id: null,
        diasHabilitados:null,
        horarioInicioTurnos: null,
        horarioFinTurnos: null,
        fechasExcluidas: null,
        duracionTurno: null,
    }
    dias: any[];
    boxType: String;
    feriados: Array<any>;

    constructor( private agendaService: AgendaService,private plex: Plex) {
            this.feriados  = [];
         }

    ngOnInit() {
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

    guardarConfiguracion($event,form) {
        
        if ($event.formValid){
      
            let agendaOperation: Observable<IAgendaMatriculaciones>;

            agendaOperation = this.agendaService.save(this.currentAgenda);

              agendaOperation.subscribe(resultado => {
                console.log('Configuración Actualizada');
                this.plex.toast('success', 'Realizado con exito','informacion', 1000);
            });
            form.resetForm();
        }
        
       
    }
    }

