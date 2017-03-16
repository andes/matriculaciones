import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
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
    currentAgenda: IAgendaMatriculaciones;
    configForm: FormGroup;
    dias: any[];
    boxType: String;
    feriados: Date[];

    constructor(private formBuilder: FormBuilder,
        private agendaService: AgendaService) { }

    ngOnInit() {
        // Inicio el select de días de la semana.
        this.dias = enumerados.getObjDias();

        // Busco la config actual.
        this.agendaService.get()
            .subscribe(datos => {
                this.currentAgenda = datos[0];
                this.loadFormulario(this.currentAgenda);
            });

        // Inicio el formulario.
        this.loadFormulario();
    }

    loadFormulario(agenda: IAgendaMatriculaciones = null) {

        let diasActuales = [];
        if (agenda) {
            diasActuales = agenda.diasHabilitados.map(element => { return enumerados.getObjeto(element); });
        }

        this.feriados = agenda ? agenda.fechasExcluidas : null;

        this.configForm = this.formBuilder.group({
            id: [agenda ? agenda._id : null],
            diasHabilitados: [ diasActuales ? diasActuales : null, [Validators.required]],
            horarioInicioTurnos: [
                agenda ? agenda.horarioInicioTurnos : null,
                [Validators.required, PlexValidator.min(8), PlexValidator.max(16)]],
            horarioFinTurnos: [
                agenda ? agenda.horarioFinTurnos : null,
                [Validators.required, PlexValidator.min(8), PlexValidator.max(16)]],
            duracionTurno: [agenda ? agenda.duracionTurno : null, [Validators.required, PlexValidator.min(1), PlexValidator.max(60)]],
            nuevaFechaEximida: [null]
        });
    }

    agregarFeriado() {
        this.feriados.push(this.configForm.controls['nuevaFechaEximida'].value);
        this.configForm.controls['nuevaFechaEximida'].reset();
    }

    eliminarFeriado(idx: number) {
        this.feriados.splice(idx, 1);
    }

    guardarConfiguracion(model: any, isValid: boolean) {

        if (isValid) {
            const diasSeleccionados = model.diasHabilitados;

            model.diasHabilitados = [];
            model.diasHabilitados = diasSeleccionados.map(element => {
                return element.id;
            });

            model.fechasExcluidas = this.feriados;

            let agendaOperation: Observable<IAgendaMatriculaciones>;

            agendaOperation = this.agendaService.save(model);

            agendaOperation.subscribe(resultado => {
                console.log('Configuración Actaulizada');
                this.boxType = 'success';
            });
        }
    }
}
